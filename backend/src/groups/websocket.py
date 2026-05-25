"""
WebSocket for Group Room Voice Chat Signaling

This handles WebRTC signaling for peer-to-peer audio in group rooms.
Architecture: Mesh network - each peer connects to every other peer.
"""
import json
from typing import Dict, Set, Optional
from fastapi import WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


class VoiceConnectionManager:
    """Manages WebSocket connections for voice signaling in group rooms."""
    
    def __init__(self):
        # group_id -> user_id -> WebSocket
        self.voice_connections: Dict[int, Dict[int, WebSocket]] = {}
        # group_id -> set of user_ids currently in voice
        self.voice_participants: Dict[int, Set[int]] = {}
    
    async def join_voice(self, websocket: WebSocket, group_id: int, user_id: int):
        """User joins voice channel."""
        
        # Initialize group if needed
        if group_id not in self.voice_connections:
            self.voice_connections[group_id] = {}
            self.voice_participants[group_id] = set()
        
        # Add connection
        self.voice_connections[group_id][user_id] = websocket
        self.voice_participants[group_id].add(user_id)
        
        # Notify existing participants
        await self.broadcast_to_voice(
            group_id,
            {
                "type": "user_joined_voice",
                "payload": {"user_id": user_id}
            },
            exclude_user_id=user_id
        )
        
        # Send current participants list to new user
        current_participants = list(self.voice_participants[group_id] - {user_id})
        await websocket.send_json({
            "type": "voice_participants",
            "payload": {"participants": current_participants}
        })
    
    def leave_voice(self, group_id: int, user_id: int):
        """User leaves voice channel."""
        if group_id in self.voice_connections:
            self.voice_connections[group_id].pop(user_id, None)
            self.voice_participants[group_id].discard(user_id)
            
            # Clean up empty groups
            if not self.voice_connections[group_id]:
                del self.voice_connections[group_id]
                del self.voice_participants[group_id]
    
    async def broadcast_to_voice(
        self,
        group_id: int,
        message: dict,
        exclude_user_id: Optional[int] = None
    ):
        """Broadcast message to all voice participants in a group."""
        if group_id not in self.voice_connections:
            return
        
        disconnected = []
        for user_id, ws in self.voice_connections[group_id].items():
            if exclude_user_id and user_id == exclude_user_id:
                continue
            
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected:
            self.leave_voice(group_id, user_id)
    
    async def send_to_user(self, group_id: int, user_id: int, message: dict):
        """Send message to specific user in voice channel."""
        if group_id in self.voice_connections:
            ws = self.voice_connections[group_id].get(user_id)
            if ws:
                try:
                    await ws.send_json(message)
                except Exception:
                    self.leave_voice(group_id, user_id)
    
    def is_user_in_voice(self, group_id: int, user_id: int) -> bool:
        """Check if user is in voice channel."""
        return (
            group_id in self.voice_participants and
            user_id in self.voice_participants[group_id]
        )


# Global manager
voice_manager = VoiceConnectionManager()


async def validate_ws_token(token: str, db: AsyncSession):
    """Validate WebSocket token and return user."""
    try:
        from ..core.dependencies import _decode_supabase_token
        payload = _decode_supabase_token(token)
        if not payload:
            return None
        
        supabase_uid = payload.get("sub")
        if not supabase_uid:
            return None
        
        from ..users.models import User
        result = await db.execute(select(User).where(User.supabase_uid == supabase_uid))
        return result.scalar_one_or_none()
    except Exception:
        return None

