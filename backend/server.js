require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const detectRoutes = require('./routes/detect');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/',(req,res) => res.send('Object Recognition API running'));

app.use('/api/auth', authRoutes);
app.use('/api/detect', detectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT , () => console.log(`server running on the ${PORT}`));