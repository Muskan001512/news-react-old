// src/routes/categories.js
import express from 'express';
import Category from '../model/category.js'; // Ensure this path is correct

const router = express.Router();

// POST request to create a new category
router.post('/createcategory', async (req, res) => {
  const { name } = req.body;

  try {
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Create new category
    const category = new Category({ name });
    await category.save();

    // Respond with the created category
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Add this to your news routes
router.get('/allcategories', async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find(); // Fetch all documents
    console.log("Categories:", categories); // Log categories for debugging
    res.status(200).json(categories); // Send categories as JSON response
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Server Error'); // Handle errors
  }
});


export default router;
