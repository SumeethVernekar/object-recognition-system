const express = require('express');
const axios = require('axios');
const protect = require('../middleware/authMiddleware');
const Detection = require('../models/Detection');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { image } = req.body; // base64 string, e.g. "data:image/jpeg;base64,...."

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemma-4-26b-a4b-it:free', // swap this string to try other vision models
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Identify all distinct objects in this image. Respond with ONLY valid JSON, no markdown, no explanation, in this exact format:
                {"objects": [{"label": "string", "confidence": "high|medium|low", "description": "short phrase"}]}`
              },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const raw = response.data.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const detection = await Detection.create({
      user: req.userId,
      objects: parsed.objects,
      imageUrl: image.slice(0, 50) + '...' // don't store full base64 in DB long-term, see note below
    });

    res.json({ objects: parsed.objects, detectionId: detection._id });
  } catch (err) {
    res.status(500).json({ message: 'Detection failed', error: err.message });
  }
});

module.exports = router;