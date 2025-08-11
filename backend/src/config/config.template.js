// Configuration template - Copy this to config.js and add your real API keys
// 
// SETUP INSTRUCTIONS:
// 1. Copy this file and rename it to "config.js"
// 2. Replace the placeholder values with your actual API keys
// 3. Never commit config.js to git (it's in .gitignore)

const config = {
    googleMaps: {
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
    },
    firebase: {
        apiKey: 'YOUR_FIREBASE_API_KEY_HERE',
        authDomain: 'your-project.firebaseapp.com',
        projectId: 'your-project-id',
        storageBucket: 'your-project.appspot.com',
        messagingSenderId: 'YOUR_SENDER_ID',
        appId: 'YOUR_APP_ID'
    }
};

// Make config available globally
window.CONFIG = config;
console.log('✅ Config loaded successfully!');