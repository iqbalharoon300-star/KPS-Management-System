// ✅ Firebase Core & Services
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

// ✅ Login Function
export async function login(email, password) {
  return signInWithEmailAndPassword(auth, password);
}

// ✅ Logout Function
export async function logout() {
  return signOut(auth);
}

// ✅ Get User Role & Full Profile
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// ✅ Page Protection
export function protectPage(requiredRoles = []) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (!location.pathname.endsWith("login.html")) {
        location.href = "./login.html";
      }
      return;
    }

    const profile = await getUserProfile(user.uid);

    if (requiredRoles.length > 0 && profile && !requiredRoles.includes(profile.role)) {
      alert("You don't have access to this page");
      location.href = "./index.html";
    }

    if (location.pathname.endsWith("login.html")) {
      location.href = "./index.html";
    }
  });
}

// ✅ Attendance Save
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

// ✅ Access UI Elements (role + name display)
export function attachUserInfo() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const data = await getUserProfile(user.uid);

    const nameEl = document.querySelector("[data-user-name]");
    const roleEl = document.querySelector("[data-user-role]");
    const sectionEl = document.querySelector("[data-user-section]");

    if (nameEl) nameEl.textContent = data?.name || "";
    if (roleEl) roleEl.textContent = data?.role || "";
    if (sectionEl) sectionEl.textContent = data?.section || "";
  });
}

// ✅ Handle Login Page form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value;

      try { await login(email, password); } 
      catch (err) { alert(err.message); }
    });
  }

  const logoutBtn = document.querySelector("[data-logout]");
  if (logoutBtn) logoutBtn.onclick = logout;

  const btnIn = document.getElementById("btnCheckIn");
  const btnOut = document.getElementById("btnCheckOut");

  if (btnIn) btnIn.onclick = async () => {
    try { await saveAttendance("checkin"); alert("✅ Checked In"); }
    catch (e) { alert(e.message); }
  };

  if (btnOut) btnOut.onclick = async () => {
    try { await saveAttendance("checkout"); alert("✅ Checked Out"); }
    catch (e) { alert(e.message); }
  };
});
