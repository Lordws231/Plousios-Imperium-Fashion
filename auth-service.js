// File: backend/services/auth.js
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

export const AuthService = {
  // Google Sign In
  signInWithGoogle: async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await auth.signInWithPopup(provider);
      await createUserProfile(result.user);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Email Sign In
  signInWithEmail: async (email, password) => {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Email Sign Up
  signUpWithEmail: async (email, password, displayName) => {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName });
      await createUserProfile(result.user);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Phone Sign In
  signInWithPhone: async (phoneNumber) => {
    try {
      const provider = new firebase.auth.PhoneAuthProvider();
      const verificationId = await provider.verifyPhoneNumber(phoneNumber, window.recaptchaVerifier);
      return verificationId;
    } catch (error) {
      throw error;
    }
  },

  // Verify Phone Code
  verifyPhoneCode: async (verificationId, code) => {
    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
      const result = await auth.signInWithCredential(credential);
      await createUserProfile(result.user);
      return result.user;
    } catch (error) {
      throw error;
    }
  },

  // Sign Out
  signOut: async () => {
    try {
      await auth.signOut();
    } catch (error) {
      throw error;
    }
  },

  // Get Current User
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Update Profile
  updateProfile: async (userId, data) => {
    try {
      await db.collection('users').doc(userId).update(data);
    } catch (error) {
      throw error;
    }
  },

  // Get User Profile
  getUserProfile: async (userId) => {
    try {
      const doc = await db.collection('users').doc(userId).get();
      return doc.data();
    } catch (error) {
      throw error;
    }
  },

  // Get User Activity
  getUserActivity: async (userId) => {
    try {
      const activities = await db.collection('activities')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      
      return activities.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  }
};

// Helper function to create user profile
async function createUserProfile(user) {
  const userRef = db.collection('users').doc(user.uid);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    const { email, displayName, phoneNumber, photoURL } = user;
    const createdAt = new Date();

    try {
      await userRef.set({
        email,
        displayName,
        phoneNumber,
        photoURL,
        createdAt,
        role: 'buyer', // default role
        nftsCreated: 0,
        nftsPurchased: 0,
        totalSales: 0,
        isVerified: false
      });
    } catch (error) {
      throw error;
    }
  }
}

// Activity logging function
export const logActivity = async (userId, activity) => {
  try {
    await db.collection('activities').add({
      userId,
      ...activity,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    throw error;
  }
};
