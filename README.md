# MoonHunt Online

A modern web-based implementation of the Loup-Garou (Werewolf) game.

## Features

- Real-time multiplayer gameplay
- Simple profile creation with name and emoji
- Room-based game system
- Multiple roles: Werewolves, Villagers, Protector, Detective
- Day/Night cycle with role-specific actions
- Real-time chat during day phase
- Spectator mode

## Technical Stack

- Frontend: React + TypeScript
- Backend: Python FastAPI
- WebSocket for real-time communication
- SQLite database

## Setup Instructions

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Start the backend server:
```bash
uvicorn main:app --reload
```

4. Start the frontend development server:
```bash
cd frontend
npm start
```

## Game Rules

[Coming soon...]
