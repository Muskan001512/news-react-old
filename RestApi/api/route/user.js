import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import User from '../model/user.js';

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
      this.statusCode = statusCode;
      this.data = data;
      this.message = message;
      this.success = statusCode < 400;
  }
}

// Register route with file upload
router.post('/register', upload.single('profileImage'), async (req, res) => {
  
  const { username, password, phone, email, role } = req.body;
  const profileImage = req.file ? req.file.path : null;

  try {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      username,
      password,
      phone,
      email,
      role,
      profileImage, // Save the image path to the user document
    });
   

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    const OPTIONS = {
      httpOnly: true,
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, OPTIONS)
      .cookie('refreshToken', refreshToken, OPTIONS)
      .json({
        user,
        accessToken,
        refreshToken,
        message: 'User logged in successfully',
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Logout route
router.post('/logout', (req, res) => {
  const OPTIONS = {
    httpOnly: true,
    expires: new Date(0), // Sets cookie expiry to the past, effectively deleting it
  };

  // console.log(OPTIONS);

  res
    .clearCookie("accessToken", OPTIONS)
    .clearCookie("refreshToken", OPTIONS)
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

// Get user by ID route
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  // console.log(req,res);

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(new ApiResponse(200, user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user by ID route
router.put('/userupdate/:id', upload.single('profileImage'), async (req, res) => {
  const { id } = req.params;
  const { username, password, phone, email, role } = req.body;
  const profileImage = req.file ? req.file.path : null;
  // console.log("body-data", req.file);

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (username) user.username = username;
    if (password) user.password = password; // Make sure to hash the password before saving
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (role) user.role = role;
    if (profileImage) user.profileImage = profileImage;

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json(new ApiResponse(200, updatedUser, 'User updated successfully'));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



export default router;
