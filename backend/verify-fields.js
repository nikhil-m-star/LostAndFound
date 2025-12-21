require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const supabase = require('./config/supabase');

async function verifyFields() {
    console.log('--- Verifying Fields ---');

    // 1. Create User
    const { data: user } = await supabase.from('users').insert({
        clerk_id: `test_user_fields_${Date.now()}`,
        email: `fields-${Date.now()}@example.com`,
        name: 'Field Tester'
    }).select().single();

    // 2. Create Item with all fields
    const { data: item } = await supabase.from('items').insert({
        title: 'Full Details Item',
        location: 'Test Location Block A',
        contact_phone: '123-456-7890',
        contact_method: 'phone',
        category: 'Electronics',
        date_event: new Date(),
        reported_by: user.id
    }).select().single();

    console.log('Inserted Item ID:', item.id);

    // 3. Fetch like the API does (raw query)
    const { data: fetchedItem, error } = await supabase
        .from('items')
        .select('*, reported_by (id, name, email)')
        .eq('id', item.id)
        .single();

    if (error) console.error('Error fetching:', error);

    // 4. Simulate API Mapping
    const mapped = {
        ...fetchedItem,
        _id: fetchedItem.id,
        createdAt: fetchedItem.created_at,
        dateEvent: fetchedItem.date_event,
        contactMethod: fetchedItem.contact_method,
        contactPhone: fetchedItem.contact_phone,
        reportedBy: fetchedItem.reported_by ? { ...fetchedItem.reported_by, _id: fetchedItem.reported_by.id } : null
    };

    console.log('Mapped Response:');
    console.log('location:', mapped.location);
    console.log('contactPhone:', mapped.contactPhone);
    console.log('reportedBy:', mapped.reportedBy);

    // Cleanup
    await supabase.from('items').delete().eq('id', item.id);
    await supabase.from('users').delete().eq('id', user.id);
}

verifyFields();
