// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ----------------------
// USE CORRECT PORT FOR RENDER
// ----------------------
const PORT = process.env.PORT || 5000;

// ----------------------
// BACKEND BASE URL FOR IMAGES
// Render provides RENDER_EXTERNAL_URL automatically
// ----------------------
const BACKEND_URL =
  process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());

// ----------------------
// STATIC IMAGES FOLDER
// ----------------------
app.use('/images', express.static(path.join(__dirname, 'images')));

// ----------------------
// MONGODB CONNECTION
// ----------------------
const MONGODB_URI = process.env.MONGO_URL; // stored in Render → Environment Variables

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB successfully connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ----------------------
// SCHEMA & MODEL
// ----------------------
const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  city: { type: String, required: true },
  location: String,
  rating: Number,
  details: String,
  imageFilename: String, // stores file name only
});

const Place = mongoose.model('Place', placeSchema);

// ----------------------
// API: FETCH PLACES
// ----------------------
app.get('/api/places', async (req, res) => {
  const { type, city } = req.query;

  if (!type || !city) {
    return res
      .status(400)
      .json({ message: 'Missing type or city query parameter.' });
  }

  try {
    const filter = {
      type: new RegExp(`^${type}$`, 'i'),
      city: new RegExp(`^${city}$`, 'i'),
    };

    let sortCriteria =
      type.toLowerCase() === 'college' ? { rating: -1 } : { name: 1 };

    const places = await Place.find(filter).sort(sortCriteria).lean();

    // Construct IMAGE URLs using Render URL
    const resultsWithImages = places.map((place) => {
      let imageUrl = '';

      if (place.imageFilename) {
        imageUrl = `${BACKEND_URL}/images/${place.imageFilename}`;
      } else {
        imageUrl = `https://picsum.photos/400/250?text=Filename+Missing`;
      }

      return {
        ...place,
        imageUrl,
      };
    });

    res.status(200).json(resultsWithImages);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ message: 'Internal server error while fetching places.' });
  }
});

// ----------------------
// START SERVER
// ----------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at: ${BACKEND_URL}`);
  console.log(`📸 Static images served at: ${BACKEND_URL}/images/`);
});

