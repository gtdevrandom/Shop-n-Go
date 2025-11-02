import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBGyhISFdzVklC1K7Y3TNyQpQ-QJWUXPIo",
  authDomain: "shopngo-2008.firebaseapp.com",
  projectId: "shopngo-2008",
  storageBucket: "shopngo-2008.firebasestorage.app",
  messagingSenderId: "931959995203",
  appId: "1:931959995203:web:f06465bad7af5899868df6",
  measurementId: "G-CJ2KZ8DCS6"
};

if(localStorage.getItem("auth")!=="true") location.href="login.html";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ref = doc(db,"lists","shopping");

const ul = document.getElementById("list");
const addBtn = document.querySelector(".add-button");
const input = document.getElementById("item");
const optionsMenu = document.getElementById("optionsMenu");

let itemsArray = [];
let draggedItem = null;
let startY = 0;
let currentIndex = -1;

// --- Live Firestore ---
onSnapshot(ref, snap => {
  itemsArray = snap.data()?.items || [];
  renderList();
});

// --- Functions ---
function renderList() {
  ul.innerHTML = "";
  itemsArray.forEach((item,index)=>{
    let li = document.createElement("li");
    li.className = "item";
    if(item.bought) li.classList.add("bought");
    if(item.notFound) li.classList.add("not-found");
    li.dataset.index = index;

    li.innerHTML = `
      <input type="checkbox" class="small-checkbox" onclick="toggleBought(${index})" ${item.bought?"checked":""}>
      <div class="item-content" onclick="toggleBought(${index})">${item.name}</div>
      <button class="not-found-button" onclick="toggleNotFound(${index})">🚫</button>
      <button class="delete-item" onclick="deleteItem(${index})">❌</button>
    `;

    li.addEventListener("touchstart", touchStart,{passive:false});
    li.addEventListener("touchmove", touchMove,{passive:false});
    li.addEventListener("touchend", touchEnd);

    ul.appendChild(li);
  });
}

window.addItem = async function() {
  const val = input.value.trim();
  if(!val) return;
  itemsArray.push({name:val,bought:false,notFound:false});
  await updateDoc(ref,{items:itemsArray});
  input.value="";
};

window.toggleBought = async function(i){
  itemsArray[i].bought = !itemsArray[i].bought;
  await updateDoc(ref,{items:itemsArray});
};

window.toggleNotFound = async function(i){
  itemsArray[i].notFound = !itemsArray[i].notFound;
  await updateDoc(ref,{items:itemsArray});
};

window.deleteItem = async function(i){
  if(!confirm("Es-tu sûr de vouloir supprimer cet article ?")) return;
  itemsArray.splice(i,1);
  await updateDoc(ref,{items:itemsArray});
};

window.clearList = async function(){
  const notFoundItems = itemsArray.filter(it=>it.notFound);
  if(notFoundItems.length>0){
    if(confirm("Les non trouvés seront conservés, supprimer le reste ?")){
      itemsArray = itemsArray.filter(it=>it.notFound);
      await updateDoc(ref,{items:itemsArray});
    }
  } else if(confirm("Supprimer toute la liste ?")){
    itemsArray=[];
    await updateDoc(ref,{items:itemsArray});
  }
};

window.downloadList = function(){
  let text = itemsArray.map(it=>it.name).join("\n");
  let blob = new Blob([text],{type:'text/plain'});
  let a = document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="shopping-list.txt";
  a.click();
  URL.revokeObjectURL(a.href);
};

window.printList = function(){
  let printWindow = window.open('','','width=800,height=600');
  printWindow.document.write('<html><head><title>Liste</title><style>body{font-family:Arial,sans-serif;font-size:18px;padding:20px;}ul{padding-left:20px;}li{margin-bottom:10px;}h1{text-align:center;}</style></head><body>');
  printWindow.document.write('<h1>Liste de Courses</h1><ul>');
  itemsArray.forEach(it=>printWindow.document.write(`<li>${it.name}</li>`));
  printWindow.document.write('</ul></body></html>');
  printWindow.document.close();
  printWindow.print();
};

window.shareList = function(){
  let text = itemsArray.map(it=>it.name).join("\n");
  const siteLink = "https://gtdevrandom.github.io/Shop-n-Go/";
  if(navigator.share){
    navigator.share({title:'Liste de Courses',text:`Ma liste :\n${text}\n${siteLink}`}).catch(console.error);
  } else alert("Partage non supporté");
};

window.loadFile = async function(e){
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload=function(ev){
    let lines = ev.target.result.split("\n").map(n=>({name:n.trim(),bought:false,notFound:false}));
    itemsArray.push(...lines);
    updateDoc(ref,{items:itemsArray});
  };
  reader.readAsText(file);
};

window.toggleOptionsMenu = function(){
  optionsMenu.style.display = optionsMenu.style.display==='block'?'none':'block';
};

// --- Drag & Drop tactile ---
function touchStart(e){
  if(e.target.closest('.small-checkbox')||e.target.closest('.delete-item')||e.target.closest('.not-found-button')) return;
  e.preventDefault();
  draggedItem = e.target.closest('.item');
  if(!draggedItem) return;
  startY = e.touches[0].clientY;
  currentIndex = Number(draggedItem.dataset.index);
  draggedItem.classList.add('dragging');
}

function touchMove(e){
  e.preventDefault();
  if(!draggedItem) return;
  let touchY = e.touches[0].clientY;
  let hovered = document.elementFromPoint(e.touches[0].clientX,touchY)?.closest('.item');
  if(hovered && hovered!==draggedItem){
    let targetIndex = Number(hovered.dataset.index);
    if(targetIndex!==currentIndex){
      let moved = itemsArray.splice(currentIndex,1)[0];
      itemsArray.splice(targetIndex,0,moved);
      currentIndex=targetIndex;
      updateDoc(ref,{items:itemsArray});
    }
  }
}

function touchEnd(e){
  if(draggedItem) draggedItem.classList.remove('dragging');
  draggedItem=null;
  currentIndex=-1;
}
