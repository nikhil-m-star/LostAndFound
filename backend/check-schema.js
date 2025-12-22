const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const supabase = require('./config/supabase');

async function checkSchema() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('User keys:', Object.keys(data[0] || {}));
        }
    } catch (err) {
        console.error(err);
    }
}

checkSchema();
