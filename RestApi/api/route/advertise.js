import express from 'express';
import multer from 'multer';
import { verifyToken, isAdmin } from '../../middlewares/Userauth.js';
import Advertisement from '../model/advertise.js';

const router = express.Router();

/// Set up multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Create news article (only admin)
router.post('/createadvertise', upload.single('image'), async (req, res) => {
    const { title, description, link } = req.body;
    const image = req.file.filename;
  
    try {
      const ad = new Advertisement({ title, description, image, link });
      await ad.save();
      res.status(201).json(ad);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Add this to your news routes
router.get('/alladvertise', async (req, res) => {
    try {
      // Fetch all categories from the database
      const advertise = await Advertisement.find(); // Fetch all documents
      console.log("Categories:", advertise); // Log advertise for debugging
      res.status(200).json(advertise); // Send advertise as JSON response
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).send('Server Error'); // Handle errors
    }
  });

  export default router;