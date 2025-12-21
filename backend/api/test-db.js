const supabase = require('../config/supabase');

module.exports = async (req, res) => {
    try {
        const { data, error } = await supabase.from('items').select('count', { count: 'exact', head: true });

        if (error) {
            throw error;
        }

        res.send(`Connected Successfully to Supabase! Configured URL: ${process.env.SUPABASE_URL}`);
    } catch (error) {
        res.status(500).send(`Connection Failed: ${error.message}`);
    }
};
