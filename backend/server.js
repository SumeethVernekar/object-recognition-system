require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get('/',(req,res) => res.send('Object Recognition API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT , () => console.log(`server running on the ${PORT}`));