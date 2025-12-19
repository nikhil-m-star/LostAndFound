require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.log('Missing keys:', missing);
    process.exit(1);
} else {
    // Check if they look valid (not empty)
    const invalid = required.filter(key => !process.env[key] || process.env[key].trim() === '');
    if (invalid.length > 0) {
        console.log('Invalid/Empty keys:', invalid);
        process.exit(1);
    }
    console.log('All Cloudinary keys are present.');
}
