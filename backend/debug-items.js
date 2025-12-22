require('dotenv').config();
const supabase = require('./config/supabase');

async function checkItems() {
    console.log('Checking Items and Reporters...');
    const { data: items, error } = await supabase
        .from('items')
        .select('id, title, reported_by, users(id, name, email)');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${items.length} items.`);
    items.forEach(item => {
        console.log('------------------------------------------------');
        console.log(`Item: ${item.title} (${item.id})`);
        console.log('Reported By ID:', item.reported_by);
        console.log('User Join:', item.users);
        if (!item.users) {
            console.log('WARNING: User join failed or user not found!');
        }
    });
}

checkItems();
