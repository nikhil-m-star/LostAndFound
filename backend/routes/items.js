const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../utils/cloudinary');

// Create item (report lost/found)
// Accept multipart/form-data with files in `images` field (max 6)
router.post('/', auth, upload.array('images', 6), async (req, res) => {
  try {
    const { title, description, location, status } = req.body;

    const images = [];

    // If files were uploaded, stream them to Cloudinary
    if (req.files && req.files.length) {
      // helper to upload a buffer via upload_stream
      const uploadBuffer = (fileBuffer, filename) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'lost-and-found' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
          stream.end(fileBuffer);
        });

      for (const f of req.files) {
        // f.buffer is available because we used memoryStorage
        const result = await uploadBuffer(f.buffer, f.originalname);
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    // Backwards compatible: if client sent images as JSON in body, include them
    if (!images.length && req.body.images) {
      try {
        const parsed = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        if (Array.isArray(parsed)) parsed.forEach(i => images.push(i));
      } catch (e) {
        // ignore parse errors
      }
    }

    const item = new Item({ title, description, location, status, images, reportedBy: req.user.id });
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get items (with simple search via query params)
router.get('/', async (req, res) => {
  try {
    const { q, status, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }, { location: new RegExp(q, 'i') }];
    if (status) filter.status = status;

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', '-password');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
