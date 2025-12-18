require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');

        // 1. Create Dummy User
        let user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            user = new User({ name: 'Test User', email: 'test@example.com', password: 'password' });
            await user.save();
        }
        console.log('User ID:', user._id);

        // 2. Create Item with NEW fields
        const newItem = new Item({
            title: 'Lost Keys',
            description: 'Car keys with red keychain',
            location: 'Main St',
            category: 'Accessories',
            dateEvent: new Date(),
            contactMethod: 'phone',
            contactPhone: '555-0100',
            reportedBy: user._id
        });
        await newItem.save();
        console.log('Item Created:', newItem);

        // 3. Verify Fields are saved
        const fetched = await Item.findById(newItem._id);
        if (fetched.category !== 'Accessories' || fetched.contactMethod !== 'phone') {
            console.error('FAILED: New fields not saved correctly!');
        } else {
            console.log('SUCCESS: New fields saved correctly.');
        }

        // Cleanup
        await Item.findByIdAndDelete(newItem._id);
        // await User.findByIdAndDelete(user._id); // Keep user for future tests
        console.log('Cleanup done');
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
