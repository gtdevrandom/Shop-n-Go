import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'

const firebaseConfig = {
  apiKey: "AIzaSyBGyhISFdzVklC1K7Y3TNyQpQ-QJWUXPIo",
  authDomain: "shopngo-2008.firebaseapp.com",
  projectId: "shopngo-2008",
  storageBucket: "shopngo-2008.firebasestorage.app",
  messagingSenderId: "931959995203",
  appId: "1:931959995203:web:f06465bad7af5899868df6",
  measurementId: "G-CJ2KZ8DCS6"
};


const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);

async function hashSHA256(str){
  const enc = new TextEncoder().encode(str);
  const buff = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buff)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

document.querySelector("#loginBtn").addEventListener("click", async()=>{
  const pwd = document.querySelector("#password").value;

  const ref = doc(db, "config", "auth");
  const snap = await getDoc(ref);
  const salt = snap.data().salt;
  const rightHash = snap.data().passwordHash;

  const userHash = await hashSHA256(salt + pwd);

  if(userHash === rightHash){
    localStorage.setItem("auth","true");
    location.href = "app.html";
  } else {
    document.querySelector("#error").style.display = "block"
  }
})
