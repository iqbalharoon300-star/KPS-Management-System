// ✅ Firebase Core
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
  apiKey: "AIzaSyBCkASzBYqvDpqLUh0nMjhdK1M-t0KTEms",
  authDomain: "kcal-system.firebaseapp.com",
  projectId: "kcal-system",
  storageBucket: "kcal-system.firebasestorage.app",
  messagingSenderId: "884806367197",
  appId: "1:884806367197:web:b7528f11f3ca00e4dee834",
  measurementId: "G-V4Q901PLW9"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Login
export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// ✅ Logout
export function logout() {
  return signOut(auth);
}

// ✅ Get employee profile from Firestore
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "employees", uid)); // ✅ FIXED collection name
  return snap.exists() ? snap.data() : null;
}

// ✅ Protect Page & redirect if not logged in
export function protectPage(roles = []) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const profile = await getUserProfile(user.uid);
    window.currentUser = profile; // ✅ store globally

    if (!profile) {
      alert("Profile not found in database ❌");
      logout();
      return;
    }

    // ✅ Role restrictions
    if (roles.length && !roles.includes(profile.role)) {
      alert("🚫 Unauthorized Access");
      window.location.href = "dashboard.html";
    }
  });
}

// ✅ Load User Info To Header
export function loadUserData() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const data = await getUserProfile(user.uid);

    if (document.getElementById("userName")) {
      document.getElementById("userName").textContent = data?.fullName || "User";
    }

    if (document.getElementById("userRole")) {
      document.getElementById("userRole").textContent = data?.role || "---";
    }

    if (document.getElementById("userPhoto") && data?.photoURL) {
      document.getElementById("userPhoto").src = data.photoURL;
    }
  });
}

// ✅ Save Attendance
export async function saveAttendance(action) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  await addDoc(collection(db, "attendance"), {
    userId: user.uid,
    action,
    timestamp: serverTimestamp()
  });
}
