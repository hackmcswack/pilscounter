import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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

const addPlayerForm = document.getElementById('addPlayerForm');
const leaderboardColumn1 = document.getElementById('leaderboard-column1');
const leaderboardColumn2 = document.getElementById('leaderboard-column2');
const progressBar = document.getElementById('progressBar');

// Function to add a player to the Firestore database
addPlayerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;

    try {
        await addDoc(collection(db, 'vorsere'), {
            name: name,
            pils: 0
        });
        addPlayerForm.reset();
    } catch (error) {
        console.error('Error adding player: ', error);
    }
});

// Function to get and display the leaderboard
function getLeaderboard() {
    const q = query(collection(db, 'vorsere'), orderBy('pils', 'desc'));
    onSnapshot(q, (snapshot) => {
        let totalPils = 0;
        let players = [];
        snapshot.forEach((doc) => {
            totalPils += doc.data().pils;
            players.push(doc.data());
        });


        var promille = false;

        
        // Split players into two halves
        const halfwayIndex = Math.ceil(players.length / 2);
        const firstHalf = players.slice(0, halfwayIndex);
        const secondHalf = players.slice(halfwayIndex);

        // Clear existing leaderboard
        leaderboardColumn1.innerHTML = '';
        leaderboardColumn2.innerHTML = '';

        const date = new Date();
        var currentHour = date.getHours();
        const vorsStart = 12;

        

        // Render first half in the first column
        firstHalf.forEach((player, index) => {
            const li = document.createElement('li');
            if (index === 0) {
                li.style.backgroundColor = '#FFFFFF'; // Darker gold color
                li.style.color = '#000000'; // Black text

                if(!promille){
                    li.innerHTML = `<span>${index + 1}. ${player.name} <img src="bilder/crown.png" alt="Description of the image" id="crown"></span><span>${player.pils}</span>`;
                } else{
                    var promilleCalc = ((player.pils * 18) / (80 * 0.7) - 0.15 * (currentHour - vorsStart)).toFixed(3);

                    if (promilleCalc < 0){
                        promilleCalc = 0;
                    }

                    li.innerHTML = `<span>${index + 1}. ${player.name} <img src="bilder/crown.png" alt="Description of the image" id="crown"></span><span>${promilleCalc}</span>`;
                }
            } else {

                if(!promille){
                    li.innerHTML = `<span>${index + 1}. ${player.name}</span><span>${player.pils}</span>`;
                } else{
                    var promilleCalc = ((player.pils * 18) / (80 * 0.7) - 0.15 * (currentHour - vorsStart)).toFixed(3);

                    if (promilleCalc < 0){
                        promilleCalc = 0;
                    }

                    li.innerHTML = `<span>${index + 1}. ${player.name}</span><span>${promilleCalc}</span>`;
                }

            }
            leaderboardColumn1.appendChild(li);
        });

        // Render second half in the second column
        secondHalf.forEach((player, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${halfwayIndex + index + 1}. ${player.name}</span><span>${player.pils}</span>`;
            leaderboardColumn2.appendChild(li);
        });

        document.getElementById('totalePils').textContent = totalPils;

        updateProgressBar(totalPils);
    });
}

// Function to update the progress bar
function updateProgressBar(totalPils) {
    const progress = Math.min(totalPils, 100); // Limit to 100%
    progressBar.style.width = `${progress}%`;
}

// Initial call to getLeaderboard
getLeaderboard();
