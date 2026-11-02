const express = require('express');
const axios = require('axios');
const protect = require('../middleware/authMiddleware');
const Detection = require('../models/Detection');

const router = express.Router();

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_ATTEMPTS = 3;

const PROMPT = `Identify all distinct objects in this image. Respond with ONLY valid JSON, no markdown, no explanation, in this exact format:
{"objects": [{"label": "string", "confidence": "high|medium|low", "description": "short phrase"}]}`;

// Pull the JSON object out of whatever text the model returned
function parseObjects(raw) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in model response');
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed.objects)) throw new Error('Missing objects array');
  return parsed.objects;
}

// One call to the free router. Each call may land on a different free model.
async function callFreeRouter(image) {
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: 'openrouter/free', // auto-picks an available free model that supports images
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: image } }
          ]
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 45000
    }
  );

  return {
    objects: parseObjects(response.data.choices[0].message.content),
    model: response.data.model // which free model actually answered
  };
}

router.post('/', protect, async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ message: 'No image provided' });

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { objects, model } = await callFreeRouter(image);

      const detection = await Detection.create({
        user: req.userId,
        objects,
        imageUrl: image.slice(0, 50) + '...' // don't store full base64 in DB
      });

      return res.json({ objects, detectionId: detection._id, model });
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      console.error(`Attempt ${attempt} failed:`, status || err.message);

      // A bad API key or no credits won't be fixed by retrying
      if (status === 401 || status === 402) break;
      // 429, 5xx, timeouts, bad JSON: retry (may hit a different free model)
    }
  }

  const status = lastError?.response?.status;
  const rateLimited = status === 429;

  res.status(rateLimited ? 429 : 500).json({
    message: rateLimited
      ? 'The free AI models are busy right now. Please try again in a minute.'
      : 'Detection failed. Please try again.',
    error: lastError?.response?.data?.error?.message || lastError?.message
  });
});

module.exports = router;
