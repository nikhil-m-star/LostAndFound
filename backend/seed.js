require('dotenv').config();
const connectDB = require('./config/db');
const Item = require('./models/Item');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Sample items with images
const dummyItems = [
  {
    title: 'Black Leather Wallet',
    description: 'Found a black leather wallet near Central Park entrance. Contains ID cards and credit cards. Please contact to claim.',
    location: 'Central Park, New York',
    status: 'found',
    images: [
      { url: 'https://images.unsplash.com/photo-1580894908361-6c9d7b8ea3f7?w=800&auto=format&fit=crop', public_id: 'seed_wallet_1' }
    ]
  },
  {
    title: 'Set of Keys with Keychain',
    description: 'Lost my keys at the shopping mall. Has a red keychain with a small flashlight attached. Very important to me.',
    location: 'Westfield Shopping Mall',
    status: 'lost',
    images: [
      { url: 'https://images.unsplash.com/photo-1579547621706-1a9c79d5d4c2?w=800&auto=format&fit=crop', public_id: 'seed_keys_1' }
    ]
  },
  {
    title: 'Silver Watch',
    description: 'Found a silver wristwatch on a park bench. Looks like a vintage piece. Please describe to claim.',
    location: 'Riverside Park',
    status: 'found',
    images: [
      { url: 'https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?w=800&auto=format&fit=crop', public_id: 'seed_watch_1' }
    ]
  },
  {
    title: 'Blue Backpack',
    description: 'Lost my blue backpack on the bus. Contains my laptop, charger, and some books. Reward offered for return.',
    location: 'Bus Route 42',
    status: 'lost',
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop', public_id: 'seed_backpack_1' }
    ]
  },
  {
    title: 'iPhone 13 Pro',
    description: 'Found an iPhone near the coffee shop. Has a black case with a sticker on the back. Please contact with proof of ownership.',
    location: 'Starbucks Downtown',
    status: 'found',
    images: [
      { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop', public_id: 'seed_phone_1' }
    ]
  },
  {
    title: 'Red Umbrella',
    description: 'Lost my red umbrella at the train station. It has a wooden handle and is quite distinctive.',
    location: 'Grand Central Station',
    status: 'lost',
    images: [
      { url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&auto=format&fit=crop', public_id: 'seed_umbrella_1' }
    ]
  },
  {
    title: 'Gold Necklace',
    description: 'Found a gold necklace in the restroom. It appears to be a family heirloom. Please describe the pendant to claim.',
    location: 'City Library',
    status: 'found',
    images: [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop', public_id: 'seed_necklace_1' }
    ]
  },
  {
    title: 'Bicycle - Mountain Bike',
    description: 'Lost my mountain bike. It\'s a black Trek bike with red handlebars and a water bottle holder. Last seen at the park.',
    location: 'Memorial Park',
    status: 'lost',
    images: [
      { url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&auto=format&fit=crop', public_id: 'seed_bike_1' }
    ]
  },
  {
    title: 'Glasses - Black Frame',
    description: 'Found a pair of black-rimmed glasses on a restaurant table. Please contact if these are yours.',
    location: 'Italian Restaurant on Main St',
    status: 'found',
    images: [
      { url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop', public_id: 'seed_glasses_1' }
    ]
  },
  {
    title: 'Dog - Golden Retriever',
    description: 'Lost my golden retriever named Max. He\'s friendly, has a blue collar, and responds to his name. Please help me find him!',
    location: 'Oak Street Neighborhood',
    status: 'lost',
    images: [
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop', public_id: 'seed_dog_1' }
    ]
  },
  {
    title: 'Laptop Bag - Brown Leather',
    description: 'Found a brown leather laptop bag in the conference room. Contains a MacBook and some documents.',
    location: 'Business Center, Floor 5',
    status: 'found',
    images: [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop', public_id: 'seed_laptop_bag_1' }
    ]
  },
  {
    title: 'Camera - Canon DSLR',
    description: 'Lost my Canon DSLR camera with a 50mm lens. It has a custom strap with my name on it. Very valuable to me.',
    location: 'Photography Studio',
    status: 'lost',
    images: [
      { url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&auto=format&fit=crop', public_id: 'seed_camera_1' }
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to database
    await connectDB(process.env.MONGO_URI);
    console.log('Connected to database');

    // Check if items already exist
    const existingItems = await Item.countDocuments();
    if (existingItems > 0) {
      console.log(`Database already has ${existingItems} items.`);
      console.log('Do you want to add more items? (This script will add items regardless)');
    }

    // Get or create a dummy user for reportedBy
    let dummyUser = await User.findOne({ email: 'dummy@example.com' });
    if (!dummyUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('dummy123', salt);
      dummyUser = new User({
        name: 'Dummy User',
        email: 'dummy@example.com',
        password: hashedPassword
      });
      await dummyUser.save();
      console.log('Created dummy user');
    }

    // Create items
    const itemsToCreate = dummyItems.map(itemData => ({
      ...itemData,
      reportedBy: dummyUser._id,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last 7 days
    }));

    const createdItems = await Item.insertMany(itemsToCreate);
    console.log(`✅ Successfully created ${createdItems.length} dummy items!`);

    // Summary
    const lostCount = await Item.countDocuments({ status: 'lost' });
    const foundCount = await Item.countDocuments({ status: 'found' });
    console.log(`\n📊 Summary:`);
    console.log(`   Lost items: ${lostCount}`);
    console.log(`   Found items: ${foundCount}`);
    console.log(`   Total items: ${lostCount + foundCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();

