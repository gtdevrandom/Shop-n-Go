import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, doc, updateDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBGyhISFdzVklC1K7Y3TNyQpQ-QJWUXPIo",
  authDomain: "shopngo-2008.firebaseapp.com",
  projectId: "shopngo-2008",
  storageBucket: "shopngo-2008.firebasestorage.app",
  messagingSenderId: "931959995203",
  appId: "1:931959995203:web:f06465bad7af5899868df6",
  measurementId: "G-CJ2KZ8DCS6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const refItems = doc(db,"lists","shopping");
const refFavorites = doc(db,"lists","favorites");

let itemsArray = [];
let favoriteItems = [];
let draggedItem = null;
let startY = 0;
let currentIndex = -1;

const ul = document.getElementById("list");
const input = document.getElementById("item");
const optionsMenu = document.getElementById("optionsMenu");

// --- Firestore live updates ---
onSnapshot(refItems, snap => {
  itemsArray = snap.data()?.items || [];
  renderList();
});

onSnapshot(refFavorites, snap => {
  favoriteItems = snap.data()?.items || [];
  renderList();
});

// --- Render list ---
function renderList(){
  ul.innerHTML = "";
  
  // Render favorites first
  favoriteItems.forEach((item,index)=>{
    renderItem(item, index, true);
  });
  
  // Render regular items
  itemsArray.forEach((item,index)=>{
    renderItem(item, index, false);
  });
}

function renderItem(item, index, isFavorite){
  let li = document.createElement("li");
  li.className = "item";
  if(isFavorite) li.classList.add("favorite-item");
  if(item.bought) li.classList.add("bought");
  if(item.notFound) li.classList.add("not-found");
  li.dataset.index = index;
  li.dataset.isFavorite = isFavorite ? 'true' : 'false';

  // Pour les favoris, pas de bouton de suppression
  const deleteButton = isFavorite ? '' : '<button class="delete-item">❌</button>';
  
  li.innerHTML = `
    <input type="checkbox" class="small-checkbox" ${item.bought?"checked":""}>
    <div class="item-content">${item.name}</div>
    <button class="not-found-button">🚫</button>
    ${deleteButton}
  `;

  // Events
  li.querySelector(".small-checkbox").onclick = ()=>window.toggleBought(index, isFavorite);
  li.querySelector(".item-content").onclick = ()=>window.toggleBought(index, isFavorite);
  li.querySelector(".not-found-button").onclick = ()=>window.toggleNotFound(index, isFavorite);
  
  const deleteBtn = li.querySelector(".delete-item");
  if(deleteBtn) {
    deleteBtn.onclick = ()=>window.deleteItem(index, isFavorite);
  }

  li.addEventListener("touchstart", touchStart,{passive:false});
  li.addEventListener("touchmove", touchMove,{passive:false});
  li.addEventListener("touchend", touchEnd);

  ul.appendChild(li);
}

// --- Functions exposées ---
window.addItem = async function(){
  const val = input.value.trim();
  if(!val) return;
  itemsArray.push({name:val,bought:false,notFound:false});
  await updateDoc(refItems,{items:itemsArray});
  input.value="";
};

window.toggleBought = async function(i, isFavorite){
  if(isFavorite) {
    favoriteItems[i].bought = !favoriteItems[i].bought;
    await updateDoc(refFavorites,{items:favoriteItems});
  } else {
    itemsArray[i].bought = !itemsArray[i].bought;
    await updateDoc(refItems,{items:itemsArray});
  }
};

window.toggleNotFound = async function(i, isFavorite){
  if(isFavorite) {
    favoriteItems[i].notFound = !favoriteItems[i].notFound;
    await updateDoc(refFavorites,{items:favoriteItems});
  } else {
    itemsArray[i].notFound = !itemsArray[i].notFound;
    await updateDoc(refItems,{items:itemsArray});
  }
};

window.deleteItem = async function(i, isFavorite){
  if(isFavorite) {
    alert("Les articles favoris ne peuvent pas être supprimés.");
    return;
  }
  if(!confirm("Es-tu sûr de vouloir supprimer cet article ?")) return;
  itemsArray.splice(i,1);
  await updateDoc(refItems,{items:itemsArray});
};

window.clearList = async function(){
  const notFoundItems = itemsArray.filter(it=>it.notFound);
  if(notFoundItems.length>0){
    if(confirm("Les non trouvés seront conservés, supprimer le reste ?")){
      itemsArray = itemsArray.filter(it=>it.notFound);
      await updateDoc(refItems,{items:itemsArray});
    }
  } else if(confirm("Supprimer toute la liste ?")){
    itemsArray=[];
    await updateDoc(refItems,{items:itemsArray});
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
    navigator.share({title:'Liste de Courses',text:`Voici ma liste de courses :\n${text}\n\nVisitez : ${siteLink}`}).catch(console.error);
  } else alert("Partage non supporté sur ce navigateur.");
};

window.loadFile = async function(e){
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload=function(ev){
    let lines = ev.target.result.split("\n").map(n=>({name:n.trim(),bought:false,notFound:false}));
    itemsArray.push(...lines);
    updateDoc(refItems,{items:itemsArray});
  };
  reader.readAsText(file);
};

window.toggleOptionsMenu = function(){
  optionsMenu.style.display = optionsMenu.style.display==='block'?'none':'block';
};

window.managePermanentItems = async function(){
  const itemName = prompt("Entrez le nom de l'article à ajouter aux favoris :");
  if(!itemName || !itemName.trim()) return;
  
  const newItem = {name: itemName.trim(), bought: false, notFound: false};
  const exists = favoriteItems.some(it => it.name.toLowerCase() === newItem.name.toLowerCase());
  
  if(exists) {
    alert("Cet article est déjà dans les favoris.");
    return;
  }
  
  favoriteItems.push(newItem);
  await updateDoc(refFavorites,{items:favoriteItems});
  alert("Article ajouté aux favoris !");
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
      updateDoc(refItems,{items:itemsArray});
    }
  }
}

function touchEnd(e){
  if(draggedItem) draggedItem.classList.remove('dragging');
  draggedItem=null;
  currentIndex=-1;
}
