// server.js

// Load environment variables (optional, but good practice)
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const path = require('path'); // Node.js built-in module for working with file paths

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. CONFIGURE STATIC FILE SERVING ---
// This makes the 'images' folder publicly accessible.
app.use('/images', express.static(path.join(__dirname, 'images')));


// --- 2. MongoDB Connection ---
const MONGODB_URI = 'mongodb+srv://sudeep:sudeep@cluster0.mopalea.mongodb.net/?appName=Cluster0';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB successfully connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- 3. UPDATED MongoDB Schema and Model ---
const placeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    city: { type: String, required: true },
    location: String,
    rating: Number,
    details: String,
    // Stores the filename only (e.g., 'nitk.jpg')
    imageFilename: String 
});
const Place = mongoose.model('Place', placeSchema);

// --- 4. API Endpoint to Fetch Data (Local Images) ---
app.get('/api/places', async (req, res) => {
    const { type, city } = req.query;

    if (!type || !city) {
        return res.status(400).json({ message: 'Missing type or city query parameter.' });
    }

    try {
        const filter = {
            type: new RegExp(`^${type}$`, 'i'),
            city: new RegExp(`^${city}$`, 'i')
        };
        
        let sortCriteria = (type.toLowerCase() === 'college') ? { rating: -1 } : { name: 1 };

        const places = await Place.find(filter).sort(sortCriteria).lean(); 
            
        // --- DATA TRANSFORMATION: Construct the local Image URL ---
        const resultsWithImages = places.map((place) => {
            let imageUrl = '';
            
            if (place.imageFilename) {
                // Construct the full URL path that React will use
                imageUrl = `https://idt-a8aa.onrender.com/images/${place.imageFilename}`;
            } else {
                // Fallback for database entries missing a filename
                imageUrl = `https://picsum.photos/400/250?text=Filename+Missing`;
            }
            
            return {
                ...place,
                imageUrl: imageUrl, // This is the final URL sent to the frontend
            };
        });
        
        res.status(200).json(resultsWithImages);

    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ message: 'Internal server error while fetching places.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('STATIC IMAGE SERVER: Images are served from http://localhost:5000/images/');
});

// --- 5. REQUIRED: Seed Data Function (Delete and Insert) ---
async function seedDatabase() {
    // -------------------------------------------------------------
    // 🛑 STEP 1: DELETE ALL EXISTING DATA
    // Mongoose's deleteMany({}) removes all documents from the collection.
    // -------------------------------------------------------------
    await Place.deleteMany({}); 
    console.log('✅ Existing data deleted.');

    // --- Data for 5 Colleges, 5 Hospitals, and 5 Banks ---
  const initialData = [
    // ---------------------------------
    // 🏫 COLLEGES (5 Records)
    // ---------------------------------
    { name: 'NITK Surathkal', type: 'College', city: 'Mangalore', location: 'Srinivasnagar, Surathkal', rating: 4.8, details: 'National Institute of Technology, highly ranked institution for Engineering.', imageFilename: 'nitk.jpg' },
    { name: 'Kasturba Medical College (KMC)', type: 'College', city: 'Mangalore', location: 'Light House Hill Road', rating: 4.6, details: 'Premier medical college affiliated to Manipal Academy of Higher Education (MAHE).', imageFilename: 'kmc_college.jpg' },
    { name: 'St. Aloysius College', type: 'College', city: 'Mangalore', location: 'Mangaluru', rating: 4.5, details: 'Highly regarded autonomous college; offers Arts, Science, and Commerce.', imageFilename: 'aloysius.jpg' },
    { name: 'A.B. Shetty Memorial Institute', type: 'College', city: 'Mangalore', location: 'Deralakatte', rating: 4.4, details: 'Highly ranked Dental college, affiliated with RGUHS.', imageFilename: 'ab_shetty.jpg' },
    { name: 'Sahyadri College', type: 'College', city: 'Mangalore', location: 'Adyar', rating: 4.3, details: 'Offers B.E., M.Tech, and MBA courses; known for its innovative approach.', imageFilename: 'sahyadri.jpg' },

    // ---------------------------------
    // 🏥 HOSPITALS (5 Records)
    // ---------------------------------
    { name: 'Father Muller Medical College Hospital', type: 'Hospital', city: 'Mangalore', location: 'Kankanady', rating: 4.7, details: 'Multi-speciality teaching hospital, accredited by NABL.', imageFilename: 'fathermuller.jpg' },
    { name: 'KMC Hospital, Attavar', type: 'Hospital', city: 'Mangalore', location: 'Attavar', rating: 4.6, details: 'Manipal Group multi-speciality hospital with centers of excellence.', imageFilename: 'kmc_hospital.jpg' },
    { name: 'A. J. Hospital & Research Centre', type: 'Hospital', city: 'Mangalore', location: 'Kuntikana Junction', rating: 4.4, details: 'A modern super-specialty hospital providing world-class healthcare.', imageFilename: 'aj_hospital.jpg' },
    { name: 'Indiana Hospital and Heart Institute', type: 'Hospital', city: 'Mangalore', location: 'Pumpwell (Mahaveer Circle)', rating: 4.3, details: 'Specializes in Cardiology and critical care services.', imageFilename: 'indiana.jpg' },
    { name: 'Yenepoya Specialty Hospital', type: 'Hospital', city: 'Mangalore', location: 'Kodiyalbail', rating: 4.2, details: 'Large multi-specialty hospital with various departments.', imageFilename: 'yenepoya.jpg' },
    
    // ---------------------------------
    // 🏖️ TOURIST PLACES (5 Records)
    // ---------------------------------
    { 
        name: 'Panambur Beach', 
        type: 'Tourist Place', 
        city: 'Mangalore', 
        location: 'New Mangalore Port', 
        rating: 4.6, 
        details: 'Famous beach known for cleanliness and various water sports activities.', 
        imageFilename: 'panambur_beach.png' 
    },
    { 
        name: 'Kadri Manjunath Temple', 
        type: 'Tourist Place', 
        city: 'Mangalore', 
        location: 'Kadri', 
        rating: 4.5, 
        details: 'Historic temple with Bronze idols, dedicated to Lord Manjunatha.', 
        imageFilename: 'kadri_temple.jpg' 
    },
    { 
        name: 'St. Aloysius Chapel', 
        type: 'Tourist Place', 
        city: 'Mangalore', 
        location: 'Light House Hill Road', 
        rating: 4.7, 
        details: 'Known for its stunning interior frescoes painted by Italian artist Antonio Moscheni.', 
        imageFilename: 'aloysius_chapel.jpg' 
    },
    { 
        name: 'Pilikula Nisargadhama', 
        type: 'Tourist Place', 
        city: 'Mangalore', 
        location: 'Vamanjoor', 
        rating: 4.3, 
        details: 'Integrated tourist project featuring a zoo, biological park, and boat riding.', 
        imageFilename: 'pilikula.jpg' 
    },
    { 
        name: 'Tannirbhavi Beach', 
        type: 'Tourist Place', 
        city: 'Mangalore', 
        location: 'Ganga Kere', 
        rating: 4.4, 
        details: 'A quieter, picturesque beach accessible via ferry from Sultan Battery.', 
        imageFilename: 'tannirbhavi.jpg' 
    },
];
// You need to update the seedDatabase() function in server.js with this array.

    // -------------------------------------------------------------
    // STEP 2: INSERT NEW DATA
    // insertMany() inserts the array of documents in bulk.
    // -------------------------------------------------------------
    await Place.insertMany(initialData);
    console.log(`✅ Database seeded with ${initialData.length} specific data records.`);
}

// Uncomment and run seedDatabase() once to populate your DB
// seedDatabase();