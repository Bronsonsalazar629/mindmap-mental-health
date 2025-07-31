// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyC-2qIR03QzfDZ5AHCa8q7Y503y2tnKe7g",
    authDomain: "mindmap-mental-health-1d8f7.firebaseapp.com",
    projectId: "mindmap-mental-health-1d8f7",
    storageBucket: "mindmap-mental-health-1d8f7.firebasestorage.app",
    messagingSenderId: "793337509337",
    appId: "1:793337509337:web:46ffb3bb243cb1f9f615c8",
    measurementId: "G-GTJ5T2CXHV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();