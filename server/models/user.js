const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add a name'] 
  },
  email: { 
    type: String, 
    required: [true, 'Please add an email'], 
    unique: true 
  },
  password: { 
    type: String, 
    required: [true, 'Please add a password'] 
  },
  department: { 
    type: String, 
    required: [true, 'Please specify your department'] // e.g., CS, Business, Arts
  },
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    default: 'buyer'
  },
  storeName: {
    type: String,
    default: '' // Only populated if they become a seller
  }
}, { timestamps: true }); // This automatically adds 'createdAt' and 'updatedAt'

module.exports = mongoose.model('User', userSchema);