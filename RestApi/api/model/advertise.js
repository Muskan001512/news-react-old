
import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  link: String,
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

export default Advertisement; // Default export

