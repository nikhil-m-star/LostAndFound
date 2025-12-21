const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env');
console.log('Loading env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env:', result.error);
} else {
    console.log('Dotenv parsed:', result.parsed);
}

console.log('Testing Supabase Connection...');
console.log('URL:', process.env.SUPABASE_URL ? 'Found' : 'Missing');
console.log('KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');

try {
    const supabase = require('./config/supabase');
    console.log('Supabase client initialized successfully.');
} catch (err) {
    console.error('Failed to initialize Supabase:', err.message);
}
