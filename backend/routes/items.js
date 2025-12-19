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
    const { title, description, location, status, category, dateEvent, contactMethod, contactPhone } = req.body;

    // Basic Validation
    if (!category || !dateEvent) {
      return res.status(400).json({ message: 'Category and Date of Event are required' });
    }

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

    const item = new Item({
      title,
      description,
      location,
      status,
      category,
      dateEvent,
      contactMethod,
      contactPhone,
      images,
      reportedBy: req.user.id
    });
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
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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

// Update item (only owner can update)
router.patch('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Check ownership
    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    // Update allowed fields
    const { title, description, location, category, dateEvent, contactMethod, contactPhone } = req.body;
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (location !== undefined) item.location = location;
    if (category !== undefined) item.category = category;
    if (dateEvent !== undefined) item.dateEvent = dateEvent;
    if (contactMethod !== undefined) item.contactMethod = contactMethod;
    if (contactPhone !== undefined) item.contactPhone = contactPhone;

    await item.save();
    const updatedItem = await Item.findById(item._id).populate('reportedBy', '-password');
    res.json(updatedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete item (only owner can delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Check ownership
    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    // Delete images from Cloudinary if they exist
    if (item.images && item.images.length > 0) {
      for (const img of item.images) {
        if (img.public_id) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
          } catch (err) {
            console.error('Error deleting image from Cloudinary:', err);
            // Continue even if Cloudinary deletion fails
          }
        }
      }
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
