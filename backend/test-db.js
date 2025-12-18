require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');
const connectDB = require('./config/db');

async function testDB() {
  try {
    await connectDB(process.env.MONGO_URI);
    const count = await Item.countDocuments();
    console.log(`\n✅ Database connected!`);
    console.log(`📊 Total items in database: ${count}\n`);
    
    if (count > 0) {
      const items = await Item.find().limit(3).populate('reportedBy', 'name email');
      console.log('Sample items:');
      items.forEach((item, idx) => {
        console.log(`\n${idx + 1}. ${item.title} (${item.status})`);
        console.log(`   Location: ${item.location || 'N/A'}`);
        console.log(`   Images: ${item.images?.length || 0}`);
        console.log(`   ID: ${item._id}`);
      });
    } else {
      console.log('⚠️  No items found. Run "npm run seed" to add dummy data.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testDB();

