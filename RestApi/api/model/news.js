import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  image: { type: String },
  video: { type: String },
  description: { type: String },
  createdBy: { type: String},
  category: { type: String } // Add category field
});

export default mongoose.model('News', newsSchema);


