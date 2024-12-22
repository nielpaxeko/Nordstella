import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
    apiKey: "AIzaSyAm9pu1rTLQ8mSRT6-0_UzID8nb8dyZOH0",
    authDomain: "nordstella.firebaseapp.com",
    projectId: "nordstella",
    storageBucket: "nordstella.firebasestorage.app",
    messagingSenderId: "131126228110",
    appId: "1:131126228110:web:8eeae60c1743df5bf945df",
    measurementId: "G-6D94HWTCZ3"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);


export { app, auth, db, storage, analytics };