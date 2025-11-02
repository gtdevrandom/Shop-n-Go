import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'

// même config que login.js — colle le même bloc ici :
const firebaseConfig = {
  apiKey: "AIzaSyBGyhISFdzVklC1K7Y3TNyQpQ-QJWUXPIo",
  authDomain: "shopngo-2008.firebaseapp.com",
  projectId: "shopngo-2008",
  storageBucket: "shopngo-2008.firebasestorage.app",
  messagingSenderId: "931959995203",
  appId: "1:931959995203:web:f06465bad7af5899868df6",
  measurementId: "G-CJ2KZ8DCS6"
};

// redirect si pas auth
if(localStorage.getItem("auth")!=="true") location.href="login.html";

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const ref = doc(db,"lists","shopping");

const ul = document.querySelector("#list");
const addBtn = document.querySelector("#addBtn");
const input = document.querySelector("#item");

// live update
onSnapshot(ref, snap=>{
  const arr = snap.data().items || [];
  ul.innerHTML = "";
  arr.forEach((txt,i)=>{
    const li = document.createElement("li");
    li.innerHTML = txt + '<button data-i="'+i+'">✖</button>';
    ul.appendChild(li);
  });
});

// ajouter
addBtn.onclick = async()=>{
  const v = input.value.trim();
  if(!v) return;
  const snap = await getDoc(ref);
  const arr = snap.data().items || [];
  arr.push(v);
  await updateDoc(ref,{items:arr});
  input.value="";
};

// supprimer
ul.onclick = async(e)=>{
  if(e.target.tagName!=="BUTTON")return;
  const i = +e.target.dataset.i;
  const snap = await getDoc(ref);
  const arr = snap.data().items || [];
  arr.splice(i,1);
  await updateDoc(ref,{items:arr});
};
