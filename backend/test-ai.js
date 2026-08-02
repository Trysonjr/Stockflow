require('dotenv').config();

const testAI = async () => {
    const key = process.env.GEMINI_API_KEY;
    console.log('Testing key:', key);

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS! Here are the models you can use:');
            data.models.forEach(model => console.log(model.name));
        } else {
            console.error('❌ GOOGLE ERROR:', data.error.message);
        }
    } catch (error) {
        console.error('❌ NETWORK ERROR:', error.message);
    }
    process.exit(0);
};

testAI();