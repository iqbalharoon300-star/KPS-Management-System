// app.js (ES Modules, v10+ SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { auth } from "./app.js";
import { getUserRole } from "./app.js"; 

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // USER LOGGED IN SUCCESS ✅
    // Optional: check user role in Firestore and route to respective dashboard later

    window.location.href = "./index.html"; 
  }
});

import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut 
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, setDoc, addDoc, collection, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// ✅ Replace with your exact values from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB0fPDZpHEjxc7IMFd_f0_BrvTgqGJhySA",
  authDomain: "kcal-packaging-workforce.firebaseapp.com",
  projectId: "kcal-packaging-workforce",
  // IMPORTANT: bucket name, not a URL
  storageBucket: "kcal-packaging-workforce.appspot.com",
  messagingSenderId: "1025039246589",
  appId: "1:1025039246589:web:ce37f12ec000bc03e4ca94",
  measurementId: "G-7EN3V2W0QW"
};

// Init
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ------- Auth helpers (basic email/password) -------
export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}

// Optional: read role from Firestore: users/{uid}.role -> "admin"|"manager"|"supervisor"|"employee"
export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().role || "employee") : "employee";
}

// Guard pages (redirect to login if signed out)
export function protectPage(requiredRoles = []) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Not logged in → go to login.html (adjust path if needed)
      if (!location.pathname.endsWith("login.html")) {
        location.href = "./login.html";
      }
      return;
    }

    // If page requires a role, check it
    if (requiredRoles.length > 0) {
      const role = await getUserRole(user.uid);
      if (!requiredRoles.includes(role)) {
        // No permission → send to a safe page
        alert("You don't have access to this page.");
        location.href = "./index.html";
      }
    }

    // If we’re on login and already signed in, go to dashboard
    if (location.pathname.endsWith("login.html")) {
      location.href = "./index.html";
    }
  });
}

// ------- Example: Attendance save for current user -------
export async function saveAttendance(action) {
  // action: "checkin" | "checkout"
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  const payload = {
    userId: user.uid,
    action,                 // checkin/checkout
    timestamp: serverTimestamp(),
    // You can add more fields: shift, section, device, note...
  };

  await addDoc(collection(db, "attendance"), payload);
  return true;
}

// ------- Wire up a simple login form if present -------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value;

      try {
        await login(email, password);
        // onAuthStateChanged will redirect
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Example: attach buttons if they exist
  const btnIn = document.getElementById("btnCheckIn");
  const btnOut = document.getElementById("btnCheckOut");
  if (btnIn) btnIn.onclick = async () => {
    try { await saveAttendance("checkin"); alert("Checked in"); } 
    catch (e) { alert(e.message); }
  };
  if (btnOut) btnOut.onclick = async () => {
    try { await saveAttendance("checkout"); alert("Checked out"); } 
    catch (e) { alert(e.message); }
  };
});
