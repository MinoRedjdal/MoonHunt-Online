from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
from typing import Dict, Set, Optional
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
static_path = os.path.dirname(os.path.abspath(__file__))
app.mount("/", StaticFiles(directory=static_path, html=True), name="static")

# Game state storage
class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, Dict[str, WebSocket]] = {}  # room_code -> {player_name: websocket}
        self.player_info: Dict[str, Dict[str, dict]] = {}  # room_code -> {player_name: player_info}
        self.room_hosts: Dict[str, str] = {}  # room_code -> host_name

    async def connect(self, websocket: WebSocket, room_code: str, player_name: str, player_info: dict):
        await websocket.accept()
        
        if room_code not in self.rooms:
            self.rooms[room_code] = {}
            self.player_info[room_code] = {}
            self.room_hosts[room_code] = player_name  # First player is the host
        
        self.rooms[room_code][player_name] = websocket
        self.player_info[room_code][player_name] = player_info
        
        # Notify all players in the room about the new player
        await self.broadcast_room_state(room_code)

    def disconnect(self, room_code: str, player_name: str):
        if room_code in self.rooms and player_name in self.rooms[room_code]:
            del self.rooms[room_code][player_name]
            del self.player_info[room_code][player_name]
            
            # If room is empty, clean it up
            if not self.rooms[room_code]:
                del self.rooms[room_code]
                del self.player_info[room_code]
                del self.room_hosts[room_code]
            # If host left, assign new host
            elif player_name == self.room_hosts[room_code] and self.rooms[room_code]:
                self.room_hosts[room_code] = next(iter(self.rooms[room_code].keys()))

    async def broadcast_room_state(self, room_code: str):
        if room_code in self.rooms:
            room_state = {
                "players": self.player_info[room_code],
                "host": self.room_hosts[room_code]
            }
            for connection in self.rooms[room_code].values():
                await connection.send_text(json.dumps(room_state))

manager = ConnectionManager()

@app.websocket("/ws/{room_code}/{player_name}")
async def websocket_endpoint(
    websocket: WebSocket, 
    room_code: str, 
    player_name: str,
    player_emoji: Optional[str] = "👤"
):
    player_info = {
        "name": player_name,
        "emoji": player_emoji
    }
    
    await manager.connect(websocket, room_code, player_name, player_info)
    
    try:
        while True:
            data = await websocket.receive_text()
            # Handle game actions here in the future
            
    except WebSocketDisconnect:
        manager.disconnect(room_code, player_name)
        await manager.broadcast_room_state(room_code)

@app.get("/")
async def read_root():
    return {"message": "Welcome to MoonHunt Online!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
