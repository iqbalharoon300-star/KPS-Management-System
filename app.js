// ✅ Firebase Core
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

import { firebaseConfig } from "./firebase-config.js";

// ✅ Init Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Login
export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// ✅ Logout
export function attachLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => signOut(auth));
  }
}

// ✅ Get Full Employee Data
async function fetchUserData(uid) {
  const ref = doc(db, "employees", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// ✅ Load User UI Data
export async function loadUserData() {
  const user = auth.currentUser;
  if (!user) return;

  const data = await fetchUserData(user.uid);
  if (!data) return;

  window.currentUser = data;

  const nameEl = document.getElementById("userName");
  const roleEl = document.getElementById("userRole");
  const photoEl = document.getElementById("userPhoto");

  if (nameEl) nameEl.textContent = data.fullName || "User";
  if (roleEl) roleEl.textContent = data.role;
  if (photoEl) photoEl.src = data.photoURL || "assets/default-user.png";

  // Greeting
  const hour = new Date().getHours();
  let greeting = "Welcome";
  if (hour < 12) greeting = "Good Morning 🌅";
  else if (hour < 18) greeting = "Good Afternoon ☀️";
  else greeting = "Good Evening 🌙";
  
  const greetBanner = document.getElementById("greetingMessage");
  if (greetBanner) greetBanner.textContent = `${greeting}, ${data.fullName}`;
}

// ✅ Protect Pages by Login + Role
export function protectPage(options = {}) {
  const allowedRoles = options.roles || [];

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (!location.pathname.includes("login.html")) {
        location.href = "login.html";
      }
      return;
    }

    const data = await fetchUserData(user.uid);
    if (!data) return;

    window.currentUser = data;

    // role lock
    if (allowedRoles.length > 0 && !allowedRoles.includes(data.role)) {
      alert("Access Denied ❌");
      location.href = "dashboard.html";
    }
  });
}

// ✅ Save Attendance
export async function saveAttendance(action) {
  const user = auth.currentUser;
  const data = window.currentUser;

  if (!user || !data) throw new Error("Not logged in");

  await addDoc(collection(db, "attendance"), {
    uid: user.uid,
    userName: data.fullName,
    section: data.section,
    shift: data.shift,
    action,
    timestamp: serverTimestamp(),
    dateKey: new Date().toISOString().split("T")[0]
  });

  return true;
}

// ✅ Auto-actions for check in/out buttons
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      const pass = form.password.value;

      try {
        await login(email, pass);
        location.href = "dashboard.html";
      } catch (err) {
        alert("Login failed ❌ " + err.message);
      }
    });
  }

  const checkIn = document.getElementById("btnCheckIn");
  const checkOut = document.getElementById("btnCheckOut");

  if (checkIn)
    checkIn.addEventListener("click", async () => {
      await saveAttendance("IN");
      alert("✅ Checked In");
    });

  if (checkOut)
    checkOut.addEventListener("click", async () => {
      await saveAttendance("OUT");
      alert("✅ Checked Out");
    });
});
