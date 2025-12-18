const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGO_URI;
console.log('Testing connection to:', uri);

mongoose.connect(uri)
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB!');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Could not connect.', err);
        process.exit(1);
    });
