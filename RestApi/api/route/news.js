import express from 'express';
import multer from 'multer';
import { verifyToken, isAdmin } from '../../middlewares/Userauth.js';
import News from '../model/news.js';

const router = express.Router();

// Set up multer for image upload
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
router.post('/newscreate', verifyToken, isAdmin, upload.fields([{ name: 'image' }, { name: 'video' }]), async (req, res) => {
  try {
    const news = new News({
      title: req.body.title,
      description: req.body.description,
      date: new Date(),
      createdBy: req.body.createdBy,
      image: req.files['image'] ? req.files['image'][0].path : undefined,
      video: req.files['video'] ? req.files['video'][0].path : undefined,
      category: req.body.category // Assign category from request body
    });

    await news.save();
    res.status(201).send(news);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update news article by ID (only admin)
router.put('/newsupdate/:id', verifyToken, isAdmin, upload.fields([{ name: 'image' }, { name: 'video' }]), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (req.files['image']) {
    updates.image = req.files['image'][0].path;
  }
  if (req.files['video']) {
    updates.video = req.files['video'][0].path;
  }

  try {
    const updatedNews = await News.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedNews) {
      return res.status(404).send({ message: "News article not found" });
    }
    res.status(200).send(updatedNews);
  } catch (error) {
    res.status(400).send(error);
  }
});


// Delete news article by ID (only admin)
router.delete('/newsdelete/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedNews = await News.findByIdAndDelete(id);
    if (!deletedNews) {
      return res.status(404).send({ message: "News article not found" });
    }
    res.status(200).send({ message: "News article deleted successfully" });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all news articles
router.get('/getnews', async (req, res) => {
  try {
    const newsArticles = await News.find().sort({ date: -1 });
    res.status(200).send(newsArticles);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a single news article by ID
router.get('/getnews/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const newsArticle = await News.findById(id);
    if (!newsArticle) {
      return res.status(404).send({ message: "News article not found" });
    }
    res.status(200).send(newsArticle);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get news articles by category
router.get('/getnews/category/:category', async (req, res) => {
  try {
    const category = req.params.category.trim();

    const news = await News.find({ category: { $regex: new RegExp(category, 'i') } });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news' });
  }
});



// Add this to your news routes
router.get('/all/categories', async (req, res) => {
  try {
    const categories = await News.distinct('category'); // Get unique categories
    res.status(200).send(categories);
  } catch (error) {
    res.status(500).send(error);
  }
});




export default router;
