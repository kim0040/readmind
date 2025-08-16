// firebase.js - Firebase setup and authentication services

import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
// Note: We will use getFirestore in a later phase.
// import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFkz3vX9IdulY6q6QYyJiSu7r-KZrA5lg",
  authDomain: "readmind-c3832.firebaseapp.com",
  projectId: "readmind-c3832",
  storageBucket: "readmind-c3832.appspot.com",
  messagingSenderId: "631260243296",
  appId: "1:631260243296:web:7952a36fc0347358eb2a05",
  measurementId: "G-1HGS3GW0E9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const db = getFirestore(app); // To be used later

// --- Authentication Functions ---

/**
 * Signs up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export function signUpWithEmail(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Signs in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export function logInWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 */
export function logOut() {
    return signOut(auth);
}

/**
 * Attaches a listener for changes to the user's authentication state.
 * @param {function(User):void} callback - The function to call when the auth state changes.
 * @returns {import("firebase/auth").Unsubscribe}
 */
export function onAuthStateChangedListener(callback) {
    return onAuthStateChanged(auth, callback);
}
