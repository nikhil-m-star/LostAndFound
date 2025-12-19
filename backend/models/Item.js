const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Accessories', 'Documents', 'Others']
  },
  dateEvent: { type: Date, required: true }, // Date lost or found
  contactMethod: { type: String, enum: ['email', 'phone'], default: 'email' },
  contactPhone: { type: String },
  status: { type: String, enum: ['lost', 'found'], default: 'lost' },
  images: [{ url: String, public_id: String }],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Item', ItemSchema);
