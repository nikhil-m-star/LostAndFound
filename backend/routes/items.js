const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase'); // Supabase Client
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../utils/cloudinary');

// Create item (report lost/found)
router.post('/', auth, upload.array('images', 6), async (req, res) => {
  try {
    console.log('[DEBUG] POST /items Body:', req.body); // Check if reporterName is here
    const { title, description, location, status, category, dateEvent, contactMethod, contactPhone } = req.body;

    // Basic Validation
    if (!category || !dateEvent) {
      return res.status(400).json({ message: 'Category and Date of Event are required' });
    }

    const images = [];

    // If files were uploaded, stream them to Cloudinary
    if (req.files && req.files.length) {
      const uploadBuffer = (fileBuffer, filename) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'lost-and-found' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
          stream.end(fileBuffer);
        });

      for (const f of req.files) {
        const result = await uploadBuffer(f.buffer, f.originalname);
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    // Backwards compatible: if client sent images as JSON in body
    if (!images.length && req.body.images) {
      try {
        const parsed = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        if (Array.isArray(parsed)) parsed.forEach(i => images.push(i));
      } catch (e) {
        // ignore parse errors
      }
    }

    // Insert into Supabase
    // OPTIONAL: Update user name if provided from frontend
    // This ensures that the user's latest name from Clerk is stored in our Users table
    if (req.body.reporterName) {
      try {
        await supabase.from('users').update({
          name: req.body.reporterName,
          // Only update email if it's missing or valid? Actually email is key.
          // email: req.body.reporterEmail // Don't blindly update email as it identifies user
        }).eq('id', req.user.id);
      } catch (e) {
        console.error('Failed to update user name from report:', e);
      }
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('items')
      .insert({
        title,
        description,
        location,
        status,
        category,
        date_event: dateEvent, // Snake case mapping
        contact_method: contactMethod,
        contact_phone: contactPhone,
        images,
        reported_by: req.user.id // UUID from Supabase auth middleware
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      throw error;
    }

    // Map snake_case back to camelCase for frontend compatibility if needed, 
    // BUT frontend likely just needs properties. Let's try to return what Supabase returns.
    // If frontend expects 'dateEvent', we might need to transform.
    // For now, let's keep it simple and see if frontend breaks.
    // Actually, better to map it to ensure compatibility.

    // Helper to map DB snake_case to API camelCase
    const mapItem = (item) => ({
      ...item,
      dateEvent: item.date_event,
      contactMethod: item.contact_method,
      contactPhone: item.contact_phone,
      reportedBy: item.reported_by,
      _id: item.id // Alias for mongo compatibility if needed
    });

    res.json(mapItem(data));

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get current user's items
router.get('/my-items', auth, async (req, res) => {
  try {
    console.log(`[DEBUG] GET /my-items using User ID: ${req.user.id}`);
    const { data, error } = await supabase
      .from('items')
      .select('*, reported_by:users (id, name, email)')
      .eq('reported_by', req.user.id)
      .order('created_at', { ascending: false });

    console.log(`[DEBUG] Found ${data?.length} items for user ${req.user.id}`);

    if (error) throw error;

    // Map response
    const items = data.map(item => ({
      ...item,
      _id: item.id,
      createdAt: item.created_at,
      dateEvent: item.date_event,
      contactMethod: item.contact_method,
      contactPhone: item.contact_phone,
      reportedBy: item.reported_by ? { ...item.reported_by, _id: item.reported_by.id } : null
    }));

    res.json(items);
  } catch (err) {
    console.error('Error fetching my items:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get items (with simple search via query params)
router.get('/', async (req, res) => {
  try {
    const { q, status, limit = 20, page = 1 } = req.query;

    let query = supabase
      .from('items')
      .select('*, reported_by:users (id, name, email)'); // Join including ID

    // Filtering
    if (status) {
      query = query.eq('status', status);
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`);
    }

    // Pagination
    const from = (page - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Map response
    const items = data.map(item => ({
      ...item,
      _id: item.id, // Frontend compatibility
      createdAt: item.created_at, // Map created_at to createdAt
      dateEvent: item.date_event,
      contactMethod: item.contact_method,
      contactPhone: item.contact_phone,
      reportedBy: item.reported_by ? { ...item.reported_by, _id: item.reported_by.id } : null
    }));

    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    // Validate UUID format to prevent 500 triggers
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(404).json({ message: 'Invalid Item ID' });
    }

    const { data: item, error } = await supabase
      .from('items')
      .select('*, reported_by:users (id, name, email)') // Join including ID
      .eq('id', req.params.id)
      .single();

    if (error || !item) return res.status(404).json({ message: 'Item not found' });

    // Map response
    const mappedItem = {
      ...item,
      _id: item.id, // Frontend compatibility
      createdAt: item.created_at, // Map created_at to createdAt
      dateEvent: item.date_event,
      contactMethod: item.contact_method,
      contactPhone: item.contact_phone,
      reportedBy: item.reported_by ? { ...item.reported_by, _id: item.reported_by.id } : null
    };

    res.json(mappedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update item (only owner can update)
router.patch('/:id', auth, async (req, res) => {
  try {
    // Check ownership first
    const { data: existingItem, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingItem) return res.status(404).json({ message: 'Item not found' });

    if (existingItem.reported_by !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    // Update allowed fields
    const { title, description, location, category, dateEvent, contactMethod, contactPhone } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    if (category !== undefined) updates.category = category;
    if (dateEvent !== undefined) updates.date_event = dateEvent;
    if (contactMethod !== undefined) updates.contact_method = contactMethod;
    if (contactPhone !== undefined) updates.contact_phone = contactPhone;

    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, reported_by:users (name, email)')
      .single();

    if (updateError) throw updateError;

    res.json({
      ...updatedItem,
      dateEvent: updatedItem.date_event,
      contactMethod: updatedItem.contact_method,
      contactPhone: updatedItem.contact_phone,
      reportedBy: updatedItem.reported_by
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete item (only owner can delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check ownership
    const { data: existingItem, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingItem) return res.status(404).json({ message: 'Item not found' });

    if (existingItem.reported_by !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    // Delete images from Cloudinary if they exist
    // Note: 'images' is JSONB, so it's a parsed array already if Supabase typed it correctly,
    // otherwise it returns array of objects.
    const images = existingItem.images;
    if (images && Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.public_id) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
          } catch (err) {
            console.error('Error deleting image from Cloudinary:', err);
          }
        }
      }
    }

    // Delete from Supabase
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
