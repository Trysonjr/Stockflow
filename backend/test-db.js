require('dotenv').config();
const db = require('./config/db');

const testConnection = async () => {
    try {
        console.log('Trying to connect to database:', process.env.DB_NAME);
        
        // 1. Check if we can connect
        await db.query('SELECT 1');
        console.log('✅ Database connection SUCCESSFUL!');

        // 2. Check if the users table exists and has data
        const [users] = await db.query('SELECT * FROM users');
        console.log('✅ Found', users.length, 'users in the database.');
        
        if (users.length > 0) {
            console.log('Here is the first user:', users[0].email);
        } else {
            console.log('⚠️ WARNING: The users table is empty!');
        }

    } catch (error) {
        console.error('❌ DATABASE ERROR:', error.message);
    } finally {
        process.exit(0);
    }
};

testConnection();