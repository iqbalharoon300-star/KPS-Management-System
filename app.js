import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB0fPDZpHEjxc7IMFd_f0_BrvTgqGJhySA",
  authDomain: "kcal-packaging-workforce.firebaseapp.com",
  projectId: "kcal-packaging-workforce",
  storageBucket: "kcal-packaging-workforce.appspot.com",
  messagingSenderId: "1025039246589",
  appId: "1:1025039246589:web:ce37f12ec000bc03e4ca94",
  measurementId: "G-7EN3V2W0QW"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Login Function (FIXED)
export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// ✅ Logout
export function logout() {
  return signOut(auth);
}

// ✅ Get User Profile
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// ✅ Page security
export function protectPage(roles = []) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (!location.pathname.endsWith("login.html")) {
        location.href = "login.html";
      }
      return;
    }
    
    const profile = await getUserProfile(user.uid);

    if (roles.length > 0 && profile && !roles.includes(profile.role)) {
      alert("🚫 Access Denied");
      location.href = "dashboard.html";
    }
  });
}

// ✅ Save attendance
export async function saveAttendance(action) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  await addDoc(collection(db, "attendance"), {
    userId: user.uid,
    action,
    timestamp: serverTimestamp()
  });
  return true;
}
