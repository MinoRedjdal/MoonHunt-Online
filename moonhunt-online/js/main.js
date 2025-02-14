// Game State
const gameState = {
    currentScreen: 'homeScreen',
    playerName: '',
    selectedEmoji: '',
    roomCode: '',
    isHost: false,
    players: [],
    gameSettings: {
        playerCount: 8,
        werewolfCount: 2,
        includeProtector: true,
        includeDetective: true
    }
};

// DOM Elements
const screens = document.querySelectorAll('.screen');
const homeScreen = document.getElementById('homeScreen');
const roomOptionsScreen = document.getElementById('roomOptionsScreen');
const createRoomScreen = document.getElementById('createRoomScreen');
const joinRoomScreen = document.getElementById('joinRoomScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const rulesModal = document.getElementById('rulesModal');

// Navigation Functions
function showScreen(screenId) {
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Home Screen
    document.getElementById('startBtn').addEventListener('click', () => {
        const name = document.getElementById('playerName').value.trim();
        if (name) {
            gameState.playerName = name;
            showScreen('roomOptionsScreen');
        } else {
            alert('Please enter your name');
        }
    });

    document.getElementById('rulesBtn').addEventListener('click', () => {
        rulesModal.classList.add('active');
    });

    // Emoji Selection
    const emojis = document.querySelectorAll('.emoji');
    emojis.forEach(emoji => {
        emoji.addEventListener('click', () => {
            emojis.forEach(e => e.classList.remove('selected'));
            emoji.classList.add('selected');
            gameState.selectedEmoji = emoji.dataset.emoji;
        });
    });

    // Room Options
    document.getElementById('createRoomBtn').addEventListener('click', () => {
        showScreen('createRoomScreen');
    });

    document.getElementById('joinRoomBtn').addEventListener('click', () => {
        showScreen('joinRoomScreen');
    });

    // Create Room
    document.getElementById('createGameBtn').addEventListener('click', () => {
        gameState.isHost = true;
        gameState.roomCode = generateRoomCode();
        updateGameSettings();
        showScreen('lobbyScreen');
        updateLobbyDisplay();
    });

    // Join Room
    document.getElementById('joinGameBtn').addEventListener('click', () => {
        const code = document.getElementById('roomCode').value.toUpperCase();
        if (code.length === 8) {
            gameState.roomCode = code;
            showScreen('lobbyScreen');
            updateLobbyDisplay();
        } else {
            alert('Please enter a valid 8-character room code');
        }
    });

    // Back Buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showScreen('roomOptionsScreen');
        });
    });

    // Modal Close
    document.querySelector('.close-modal').addEventListener('click', () => {
        rulesModal.classList.remove('active');
    });

    // Leave Room
    document.querySelector('.leave-btn').addEventListener('click', () => {
        gameState.isHost = false;
        gameState.roomCode = '';
        gameState.players = [];
        showScreen('roomOptionsScreen');
    });
});

// Utility Functions
function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

function updateGameSettings() {
    gameState.gameSettings.playerCount = parseInt(document.getElementById('playerCount').value);
    gameState.gameSettings.werewolfCount = parseInt(document.getElementById('werewolfCount').value);
    gameState.gameSettings.includeProtector = document.getElementById('includeProtector').checked;
    gameState.gameSettings.includeDetective = document.getElementById('includeDetective').checked;
}

function updateLobbyDisplay() {
    document.getElementById('roomCodeDisplay').textContent = gameState.roomCode;
    document.getElementById('hostControls').style.display = gameState.isHost ? 'block' : 'none';
    
    // Add current player to the list if not already present
    if (!gameState.players.find(p => p.name === gameState.playerName)) {
        gameState.players.push({
            name: gameState.playerName,
            emoji: gameState.selectedEmoji
        });
    }

    // Update player list
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    gameState.players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.emoji} ${player.name}${player.name === gameState.playerName ? ' (You)' : ''}`;
        playersList.appendChild(li);
    });
}
