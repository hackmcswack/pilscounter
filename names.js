import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, getDocs, doc, updateDoc, increment, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const API_KEY = '';

async function getApiKey() {
    try {
      const response = await fetch('/.netlify/functions/getApiKey');
      const data = await response.json();
      return data.apiKey;
    } 
    catch (error) {
      console.error('Error fetching API key:', error);
    }
  }
  
  async function init() {
    const apiKey = await getApiKey();
    API_KEY = apiKey;
  }
  
  init();

// Firebase configuration
const firebaseConfig = {
    apiKey: API_KEY,
    authDomain: "pilscounter.firebaseapp.com",
    projectId: "pilscounter",
    storageBucket: "pilscounter.appspot.com",
    messagingSenderId: "369329784443",
    appId: "1:369329784443:web:2f0cd6c99a3df3952004de",
    measurementId: "G-ETLNHS8CQB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const namesList = document.getElementById('namesList');
const adjustPils = document.getElementById('adjustPils');
const plusButton = document.getElementById('plusButton');
const minusButton = document.getElementById('minusButton');
const pilsCount = document.getElementById('pilsCount');
const title = document.getElementById('title');
let selectedPlayerDoc = null;

// Function to fetch and display names
function displayNames() {
    const q = query(collection(db, 'vorsere'), orderBy('pils', 'desc'));
    onSnapshot(q, (snapshot) => {
        let totalPils = 0;
        let players = [];
        snapshot.forEach((doc) => {
            const player = doc.data();
            player.id = doc.id; // Add document ID to player object
            totalPils += player.pils;
            players.push(player);
        });

        // Clear existing leaderboard
        namesList.innerHTML = '';
        // Render players
        players.forEach((player) => {
            const li = document.createElement('li');
            const name = player.name;
            const fontSize = name.length >= 8 ? 'smaller' : 'inherit';

            li.innerHTML += `<span style="font-size: ${fontSize}">${name}</span><span>${player.pils}</span>`;
            namesList.appendChild(li);

            

            li.addEventListener('click', () => {
                selectedPlayerDoc = doc(db, 'vorsere', player.id); // Correct reference
                title.textContent = player.name;
                pilsCount.textContent = player.pils;
                adjustPils.classList.remove('hidden');
                namesList.classList.add('hidden');
            });
        });

        document.getElementById('totalePils').textContent = totalPils;
        updateProgressBar(totalPils);
    });
}

// Function to update pils count
async function updatePils(amount) {
    if (selectedPlayerDoc) {
        if (amount < 0 && pilsCount.textContent === '0') {
            return;
        }

        await updateDoc(selectedPlayerDoc, {
            pils: increment(amount)
        });

        // Update the displayed pils count
        onSnapshot(selectedPlayerDoc, (doc) => {
            pilsCount.textContent = doc.data().pils;
        });

        // Get total pils count
        const querySnapshot = await getDocs(collection(db, 'vorsere'));
        let totalPils = 0;
        querySnapshot.forEach((doc) => {
            totalPils += doc.data().pils;
        });

        updateProgressBar(totalPils);
    }
}

// Function to update the progress bar
function updateProgressBar(totalPils) {
    const progress = Math.min(totalPils, 100); // Limit to 100%
    document.getElementById('totalePils').textContent = "Totale pils: " + totalPils;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

document.getElementById('backLink').addEventListener('click', function () {
    window.location.href = 'index.html';
});

// Event listeners for plus and minus buttons
plusButton.addEventListener('click', () => updatePils(1));
minusButton.addEventListener('click', () => updatePils(-1));

// Initial call to display names
displayNames();
