---
trigger: always_on
---

# TasteMap Real-time & WebSocket Rules

## Core Philosophy

**You are a Real-time Systems Engineer building TasteMap's live collaboration features.**

- **Priority 1: Connection Management** — Robust WebSocket lifecycle (connect, heartbeat, reconnect, disconnect)
- **Priority 2: State Synchronization** — Efficient broadcasting of room state changes
- **Priority 3: Voice Chat Scaffold** — WebRTC integration points with clear swap boundaries
- **Priority 4: Scalability** — Redis-backed pub/sub for multi-server deployments

---

## WebSocket Architecture

### Connection Flow

```
Client                    Server
  |                         |
  |──[1. WS Connect]───────>|
  |   /ws/groups/{id}       |
  |                         |
  |<──[2. Auth Token]───────|
  |   Query param / header  |
  |                         |
  |<──[3. Connection OK]────|
  |   {type: "connected"}    |
  |                         |
  |<──[4. Room State]──────|
  |   {type: "room_state"}  |
  |                         |
  |<──[5. Heartbeat]───────>|
  |   Every 30s ping/pong  |
```

### FastAPI WebSocket Endpoint

```python
# backend/src/groups/websocket.py
from fastapi import WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Set
import json
import asyncio

from ..core.deps import get_async_session, get_current_user_ws
from ..db.session import get_async_session
from . import service


class ConnectionManager:
    """Manage WebSocket connections for group rooms."""
    
    def __init__(self):
        # room_id -> set of WebSocket connections
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # room_id -> user_id -> metadata
        self.room_members: Dict[int, Dict[int, dict]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: int, user_id: int):
        """Accept connection and track it."""
        await websocket.accept()
        
        # Initialize room if needed
        if room_id not in self.active_connections:
            self.active_connections[room_id] = set()
            self.room_members[room_id] = {}
        
        # Add connection
        self.active_connections[room_id].add(websocket)
        self.room_members[room_id][user_id] = {
            'websocket': websocket,
            'is_ready': False,
            'is_speaking': False,
            'joined_at': datetime.utcnow().isoformat()
        }
    
    def disconnect(self, websocket: WebSocket, room_id: int, user_id: int):
        """Remove connection tracking."""
        if room_id in self.active_connections:
            self.active_connections[room_id].discard(websocket)
            
            # Clean up empty rooms
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                del self.room_members[room_id]
            elif user_id in self.room_members[room_id]:
                del self.room_members[room_id][user_id]
    
    async def broadcast_to_room(self, room_id: int, message: dict):
        """Send message to all connections in a room."""
        if room_id not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[room_id]:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        
        # Clean up failed connections
        for conn in disconnected:
            self.active_connections[room_id].discard(conn)


# Global connection manager (use Redis for multi-server in production)
manager = ConnectionManager()


@router.websocket("/ws/groups/{group_id}")
async def group_websocket(
    websocket: WebSocket,
    group_id: int,
    token: str = Query(...),  # Auth token from query param
    db: AsyncSession = Depends(get_async_session)
):
    """
    WebSocket endpoint for group lobby real-time features.
    
    Protocol:
    - Client -> Server: {type: "action", payload: {...}}
    - Server -> Client: {type: "event", payload: {...}}
    """
    
    # ─────────────────────────────────────────
    # 1. Authenticate
    # ─────────────────────────────────────────
    
    try:
        user = await validate_ws_token(token, db)
    except Exception:
        await websocket.close(code=4001, reason="Invalid token")
        return
    
    # ─────────────────────────────────────────
    # 2. Verify Group Membership
    # ─────────────────────────────────────────
    
    is_member = await service.is_group_member(db, group_id, user.id)
    if not is_member:
        await websocket.close(code=4002, reason="Not a group member")
        return
    
    # ─────────────────────────────────────────
    # 3. Accept Connection
    # ─────────────────────────────────────────
    
    await manager.connect(websocket, group_id, user.id)
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "payload": {
                "user_id": user.id,
                "group_id": group_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
        # Send current room state
        room_state = await _get_room_state(db, group_id)
        await websocket.send_json({
            "type": "room_state",
            "payload": room_state
        })
        
        # Broadcast join to others
        await manager.broadcast_to_room(group_id, {
            "type": "member_joined",
            "payload": {
                "user_id": user.id,
                "username": user.username,
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
        # ─────────────────────────────────────────
        # 4. Message Loop
        # ─────────────────────────────────────────
        
        while True:
            try:
                # Receive message with timeout for heartbeat
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0
                )
                
                message = json.loads(data)
                await _handle_client_message(
                    websocket, group_id, user.id, message, db
                )
                
            except asyncio.TimeoutError:
                # Send ping, expect pong
                try:
                    await websocket.send_json({"type": "ping"})
                    pong = await asyncio.wait_for(
                        websocket.receive_text(),
                        timeout=5.0
                    )
                    if json.loads(pong).get("type") != "pong":
                        break
                except Exception:
                    break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # ─────────────────────────────────────────
        # 5. Cleanup on Disconnect
        # ─────────────────────────────────────────
        
        manager.disconnect(websocket, group_id, user.id)
        
        # Broadcast leave to others
        await manager.broadcast_to_room(group_id, {
            "type": "member_left",
            "payload": {
                "user_id": user.id,
                "username": user.username,
                "timestamp": datetime.utcnow().isoformat()
            }
        })


async def _handle_client_message(
    websocket: WebSocket,
    group_id: int,
    user_id: int,
    message: dict,
    db: AsyncSession
):
    """Handle incoming client messages."""
    
    msg_type = message.get("type")
    payload = message.get("payload", {})
    
    handlers = {
        "chat_message": _handle_chat_message,
        "ready_status": _handle_ready_status,
        "voice_signal": _handle_voice_signal,
        "typing_indicator": _handle_typing_indicator,
        "pong": lambda *args: None,  # Heartbeat response
    }
    
    handler = handlers.get(msg_type)
    if handler:
        await handler(websocket, group_id, user_id, payload, db)
    else:
        await websocket.send_json({
            "type": "error",
            "payload": {"message": f"Unknown message type: {msg_type}"}
        })


async def _handle_chat_message(
    websocket: WebSocket,
    group_id: int,
    user_id: int,
    payload: dict,
    db: AsyncSession
):
    """Handle chat message from client."""
    
    content = payload.get("content", "").strip()
    if not content or len(content) > 1000:
        return
    
    # Save to database
    message = await service.save_chat_message(
        db, group_id, user_id, content
    )
    
    # Broadcast to all room members
    await manager.broadcast_to_room(group_id, {
        "type": "chat_message",
        "payload": {
            "id": message.id,
            "user_id": user_id,
            "username": message.user.username,
            "content": content,
            "timestamp": message.created_at.isoformat()
        }
    })


async def _handle_ready_status(
    websocket: WebSocket,
    group_id: int,
    user_id: int,
    payload: dict,
    db: AsyncSession
):
    """Handle ready status toggle."""
    
    is_ready = payload.get("is_ready", False)
    
    # Update in-memory state
    if group_id in manager.room_members:
        if user_id in manager.room_members[group_id]:
            manager.room_members[group_id][user_id]['is_ready'] = is_ready
    
    # Broadcast status change
    await manager.broadcast_to_room(group_id, {
        "type": "ready_status_changed",
        "payload": {
            "user_id": user_id,
            "is_ready": is_ready,
            "timestamp": datetime.utcnow().isoformat()
        }
    })
    
    # Check if all members ready
    await _check_all_ready(group_id)


async def _get_room_state(db: AsyncSession, group_id: int) -> dict:
    """Get current room state for new connections."""
    
    group = await service.get_group_with_members(db, group_id)
    
    return {
        "group": {
            "id": group.id,
            "name": group.name,
            "host_id": group.host_id
        },
        "members": [
            {
                "user_id": member.id,
                "username": member.username,
                "is_online": member.id in manager.room_members.get(group_id, {}),
                "is_ready": manager.room_members.get(group_id, {}).get(member.id, {}).get('is_ready', False),
                "is_speaking": manager.room_members.get(group_id, {}).get(member.id, {}).get('is_speaking', False)
            }
            for member in group.members
        ],
        "recent_messages": await service.get_recent_messages(db, group_id, limit=50)
    }
```

---

## Message Protocol

### Client → Server

```typescript
// Chat message
{
  type: "chat_message",
  payload: {
    content: string,  // Max 1000 chars
  }
}

// Ready status toggle
{
  type: "ready_status",
  payload: {
    is_ready: boolean,
  }
}

// WebRTC signaling (voice chat)
{
  type: "voice_signal",
  payload: {
    signal_type: "offer" | "answer" | "ice-candidate",
    target_user_id: number,
    data: object,  // WebRTC signaling data
  }
}

// Typing indicator
{
  type: "typing_indicator",
  payload: {
    is_typing: boolean,
  }
}

// Heartbeat response
{
  type: "pong",
  payload: {}
}
```

### Server → Client

```typescript
// Connection confirmation
{
  type: "connected",
  payload: {
    user_id: number,
    group_id: number,
    timestamp: string,
  }
}

// Room state snapshot
{
  type: "room_state",
  payload: {
    group: { id, name, host_id },
    members: Array<{
      user_id: number,
      username: string,
      is_online: boolean,
      is_ready: boolean,
      is_speaking: boolean,
    }>,
    recent_messages: Message[],
  }
}

// Member joined
{
  type: "member_joined",
  payload: {
    user_id: number,
    username: string,
    timestamp: string,
  }
}

// Member left
{
  type: "member_left",
  payload: {
    user_id: number,
    username: string,
    timestamp: string,
  }
}

// Chat message broadcast
{
  type: "chat_message",
  payload: {
    id: number,
    user_id: number,
    username: string,
    content: string,
    timestamp: string,
  }
}

// Ready status update
{
  type: "ready_status_changed",
  payload: {
    user_id: number,
    is_ready: boolean,
    timestamp: string,
  }
}

// Voice signal relay
{
  type: "voice_signal",
  payload: {
    signal_type: "offer" | "answer" | "ice-candidate",
    from_user_id: number,
    data: object,
  }
}

// All members ready (launch trigger)
{
  type: "all_ready",
  payload: {
    countdown_seconds: number,
    members: number[],
  }
}

// Heartbeat ping
{
  type: "ping",
  payload: {}
}
```

---

## Voice Chat Scaffold (WebRTC)

### Architecture

TasteMap uses a scaffold pattern for voice chat:
- **Phase 1:** Basic WebRTC peer connections (P2P mesh)
- **Future:** Swap with LiveKit/Daily.co managed infrastructure

```
┌─────────────────────────────────────────┐
│           TasteMap Voice Chat            │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐    ┌─────────┐            │
│  │ User A  │◄──►│ User B  │            │
│  │(Peer 1) │◄──►│(Peer 2) │            │
│  └────┬────┘    └────┬────┘            │
│       │              │                  │
│       └──────┬───────┘                  │
│              │                          │
│         ┌────▼────┐                     │
│         │ User C  │                     │
│         │(Peer 3) │                     │
│         └─────────┘                     │
│                                         │
│  WebRTC P2P Mesh (3-5 users max)        │
│                                         │
│  SWAP POINT: Replace with LiveKit       │
│  ┌────────────┐   ┌────────────┐       │
│  │  LiveKit   │◄──┤  Daily.co  │       │
│  │   Server   │   │   Server   │       │
│  └────────────┘   └────────────┘       │
│                                         │
└─────────────────────────────────────────┘
```

### Frontend Hook

```typescript
// frontend/src/hooks/useVoiceRoom.ts
import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceRoomState {
  isConnected: boolean;
  isMuted: boolean;
  speakingUsers: Set<number>;
  error: string | null;
}

interface VoiceRoomActions {
  toggleMute: () => void;
  joinCall: () => Promise<void>;
  leaveCall: () => void;
}

export function useVoiceRoom(roomId: number): VoiceRoomState & VoiceRoomActions {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  // Refs for WebRTC
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // SWAP POINT 1: Replace getUserMedia with Livekit Room.connect()
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      
      localStreamRef.current = stream;
      
      // Set up Voice Activity Detection (VAD)
      setupVAD(stream);
      
      return stream;
    } catch (err) {
      setError('Microphone access denied');
      throw err;
    }
  }, []);
  
  // Voice Activity Detection
  const setupVAD = (stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    
    source.connect(analyserRef.current);
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    let speakingTimeout: NodeJS.Timeout;
    
    const checkSpeaking = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      // Threshold for speaking detection
      const isSpeaking = average > 30;
      
      // Debounce speaking state
      if (isSpeaking) {
        clearTimeout(speakingTimeout);
        setSpeakingUsers(prev => new Set([...prev, -1])); // -1 represents local user
      } else {
        speakingTimeout = setTimeout(() => {
          setSpeakingUsers(prev => {
            const next = new Set(prev);
            next.delete(-1);
            return next;
          });
        }, 200);
      }
      
      requestAnimationFrame(checkSpeaking);
    };
    
    checkSpeaking();
  };
  
  // SWAP POINT 2: Replace with Livekit room.on('signal', ...)
  const handleSignaling = useCallback(async (signal: any) => {
    const { signal_type, from_user_id, data } = signal;
    
    switch (signal_type) {
      case 'offer':
        await handleOffer(from_user_id, data);
        break;
      case 'answer':
        await handleAnswer(from_user_id, data);
        break;
      case 'ice-candidate':
        await handleICECandidate(from_user_id, data);
        break;
    }
  }, []);
  
  const createPeerConnection = useCallback((userId: number): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    
    // Add local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }
    
    // Handle remote stream
    pc.ontrack = (event) => {
      // Create audio element for remote user
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.play();
    };
    
    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'voice_signal',
          payload: {
            signal_type: 'ice-candidate',
            target_user_id: userId,
            data: event.candidate,
          },
        }));
      }
    };
    
    return pc;
  }, []);
  
  const joinCall = useCallback(async () => {
    try {
      // Initialize local audio
      await initializeLocalStream();
      
      // Connect WebSocket for signaling
      const ws = new WebSocket(`ws://${API_BASE}/ws/groups/${roomId}?token=${authToken}`);
      wsRef.current = ws;
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'voice_signal') {
          handleSignaling(message.payload);
        }
      };
      
      setIsConnected(true);
    } catch (err) {
      setError('Failed to join call');
      console.error(err);
    }
  }, [roomId, initializeLocalStream, handleSignaling]);
  
  const leaveCall = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsConnected(false);
    setSpeakingUsers(new Set());
  }, []);
  
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveCall();
    };
  }, [leaveCall]);
  
  return {
    isConnected,
    isMuted,
    speakingUsers,
    error,
    toggleMute,
    joinCall,
    leaveCall,
  };
}
```

---

## Redis Pub/Sub for Multi-Server

### Scaling Pattern

```python
# backend/src/groups/redis_pubsub.py
import json
import redis.asyncio as redis
from typing import Callable

redis_client = redis.from_url("redis://localhost:6379")


class RedisPubSubManager:
    """Redis-backed pub/sub for multi-server WebSocket scaling."""
    
    def __init__(self):
        self.redis = redis_client
        self.pubsub = None
        self.message_handlers: Dict[str, Callable] = {}
    
    async def connect(self):
        """Subscribe to Redis channels."""
        self.pubsub = self.redis.pubsub()
        await self.pubsub.subscribe("group:*")
        
        # Start listening loop
        asyncio.create_task(self._listen())
    
    async def _listen(self):
        """Listen for Redis messages and route to handlers."""
        async for message in self.pubsub.listen():
            if message['type'] == 'message':
                channel = message['channel']
                data = json.loads(message['data'])
                
                # Extract group_id from channel name
                # channel format: "group:{group_id}"
                group_id = int(channel.split(":")[1])
                
                # Route to local connection manager
                await self._route_to_local(group_id, data)
    
    async def publish(self, group_id: int, message: dict):
        """Publish message to Redis channel."""
        channel = f"group:{group_id}"
        await self.redis.publish(channel, json.dumps(message))
    
    async def _route_to_local(self, group_id: int, message: dict):
        """Route Redis message to local WebSocket connections."""
        # Import local manager and broadcast
        from .websocket import manager
        await manager.broadcast_to_room(group_id, message)


# Global pub/sub manager
pubsub_manager = RedisPubSubManager()
```

---

## File References

**WebSocket Backend:**
- `backend/src/groups/websocket.py` - WebSocket endpoint
- `backend/src/groups/redis_pubsub.py` - Redis scaling
- `backend/src/core/websocket_auth.py` - WS token validation

**Frontend:**
- `frontend/src/hooks/useVoiceRoom.ts` - Voice chat hook
- `frontend/src/hooks/useGroupWebSocket.ts` - WebSocket connection
- `frontend/src/app/group-rooms/[id]/page.tsx` - Room interior

**Models:**
- `backend/src/messages/models.py` - Chat messages
- `backend/src/groups/models.py` - Group state
