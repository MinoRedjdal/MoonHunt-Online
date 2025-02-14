from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
import json
import random
import string
from pydantic import BaseModel

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Game state storage
class GameRoom:
    def __init__(self, host_id: str, settings: dict):
        self.code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        self.host_id = host_id
        self.players: Dict[str, WebSocket] = {}
        self.player_info: Dict[str, dict] = {}
        self.settings = settings
        self.state = "lobby"  # lobby, night, day
        self.roles: Dict[str, str] = {}

class GameManager:
    def __init__(self):
        self.rooms: Dict[str, GameRoom] = {}

game_manager = GameManager()

# Models
class Player(BaseModel):
    name: str
    emoji: str

class RoomSettings(BaseModel):
    max_players: int
    num_werewolves: int
    include_protector: bool
    include_detective: bool

@app.get("/")
async def read_root():
    return {"message": "Welcome to MoonHunt Online!"}

@app.post("/create-room")
async def create_room(settings: RoomSettings):
    # Implementation coming soon
    pass

@app.websocket("/ws/{room_code}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, player_id: str):
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            # Handle game logic here
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        # Handle disconnection
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
