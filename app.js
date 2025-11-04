// ======================================================
// KPS Management System – app.js (Version 2)
// Compatible with Firebase v10.13.0
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ------------------------------------------------------
// 🔹 Firebase Configuration
// ------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyB0fPDZpHEjxc7IMFd_f0_BrvTgqGJhySA",
  authDomain: "kcal-packaging-workforce.firebaseapp.com",
  projectId: "kcal-packaging-workforce",
  storageBucket: "kcal-packaging-workforce.firebasestorage.app",
  messagingSenderId: "1025039246589",
  appId: "1:1025039246589:web:ce37f12ec000bc03e4ca94",
  measurementId: "G-7EN3V2W0QW"
};

// ------------------------------------------------------
// 🔹 Initialize Firebase
// ------------------------------------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ======================================================
// 🔹 LOGIN FUNCTION (index.html)
// ======================================================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        localStorage.setItem("kpsUser", JSON.stringify(userSnap.data()));
        window.location.href = "dashboard.html";
      } else {
        alert("Access denied! You are not registered in the KPS system.");
        await signOut(auth);
      }
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Invalid email or password. Please try again.");
    }
  });
}

// ======================================================
// 🔹 AUTH PROTECTION (used on every page except login)
// ======================================================
export function protectPage() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("Access denied! You are not registered in the KPS system.");
      await signOut(auth);
      window.location.href = "index.html";
      return;
    }

    const userData = userSnap.data();
    localStorage.setItem("kpsUser", JSON.stringify(userData));

    // Update UI (header info)
    const userNameEl = document.getElementById("userName");
    const userRoleEl = document.getElementById("userRole");
    const userPhotoEl = document.getElementById("userPhoto");

    if (userNameEl) userNameEl.textContent = userData.Name || "User";
    if (userRoleEl) userRoleEl.textContent =
      `${userData.Role || "Role"} | ${userData.Section || "Section"}`;
    if (userPhotoEl && userData.PhotoURL) userPhotoEl.src = userData.PhotoURL;
  });
}

// ======================================================
// 🔹 LOGOUT FUNCTION (header button)
// ======================================================
export function attachLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      localStorage.removeItem("kpsUser");
      window.location.href = "index.html";
    });
  }
}

// ======================================================
// 🔹 AUTO LOAD USER DATA (Dashboard greeting, etc.)
// ======================================================
export function loadUserData() {
  const userData = JSON.parse(localStorage.getItem("kpsUser") || "{}");

  const userNameEl = document.getElementById("userName");
  const userRoleEl = document.getElementById("userRole");
  const userPhotoEl = document.getElementById("userPhoto");

  if (userNameEl) userNameEl.textContent = userData.Name || "User";
  if (userRoleEl) userRoleEl.textContent =
    `${userData.Role || "Role"} | ${userData.Section || "Section"}`;
  if (userPhotoEl && userData.PhotoURL) userPhotoEl.src = userData.PhotoURL;

  // Optional: Greeting (Good Morning, etc.)
  const hour = new Date().getHours();
  let greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  if (document.getElementById("greetingMessage") && userData.Name) {
    document.getElementById("greetingMessage").textContent =
      `${greeting}, ${userData.Name}!`;
  }
}
