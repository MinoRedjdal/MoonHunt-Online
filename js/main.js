// Game State
const gameState = {
    currentScreen: 'homeScreen',
    playerName: '',
    selectedEmoji: '👤',
    roomCode: '',
    isHost: false,
    players: {},
    gameSettings: {
        playerCount: 8,
        werewolfCount: 2,
        includeProtector: true,
        includeDetective: true
    },
    ws: null
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
        gameState.roomCode = generateRoomCode();
        updateGameSettings();
        showScreen('lobbyScreen');
        connectToRoom();
        updateLobbyDisplay();
    });

    // Join Room
    document.getElementById('joinGameBtn').addEventListener('click', () => {
        const code = document.getElementById('roomCode').value.toUpperCase();
        if (code.length === 8) {
            gameState.roomCode = code;
            showScreen('lobbyScreen');
            connectToRoom();
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
        disconnectFromRoom();
        gameState.isHost = false;
        gameState.roomCode = '';
        gameState.players = {};
        showScreen('roomOptionsScreen');
    });
});

// WebSocket Functions
function connectToRoom() {
    const wsUrl = `ws://localhost:8000/ws/${gameState.roomCode}/${gameState.playerName}?player_emoji=${gameState.selectedEmoji}`;
    gameState.ws = new WebSocket(wsUrl);

    gameState.ws.onopen = () => {
        console.log('Connected to game server');
    };

    gameState.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        gameState.players = data.players;
        gameState.isHost = data.host === gameState.playerName;
        updateLobbyDisplay();
    };

    gameState.ws.onclose = () => {
        console.log('Disconnected from game server');
        // Optionally handle reconnection
    };

    gameState.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        alert('Failed to connect to game server. Please try again.');
    };
}

function disconnectFromRoom() {
    if (gameState.ws) {
        gameState.ws.close();
        gameState.ws = null;
    }
}

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
    
    // Update player list
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    
    Object.values(gameState.players).forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.emoji} ${player.name}${player.name === gameState.playerName ? ' (You)' : ''}${player.name === Object.values(gameState.players)[0].name ? ' (Host)' : ''}`;
        playersList.appendChild(li);
    });
}
