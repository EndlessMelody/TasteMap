/**
 * useVoiceRoom — Discord-style Voice Chat with WebRTC
 *
 * Implements peer-to-peer audio using WebRTC with WebSocket signaling.
 * Mesh network: each peer connects to every other peer in the room.
 *
 * Usage:
 *   const { isConnected, isMuted, speakingUsers, connect, disconnect, toggleMute, remoteStreams } = useVoiceRoom(roomId, userId, token);
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { apiPost } from "@/lib/api";

export interface VoiceRoomState {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  inputVolume: number;
  outputVolume: number;
  selectedInputDeviceId: string | null;
  selectedOutputDeviceId: string | null;
  availableInputDevices: MediaDeviceInfo[];
  availableOutputDevices: MediaDeviceInfo[];
  localStream: MediaStream | null;
  error: string | null;
  speakingUsers: Set<number>;
  voiceParticipants: Set<number>;
  mutedUsers: Set<number>;
  remoteStreams: Map<number, MediaStream>;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  setInputVolume: (volume: number) => void;
  setOutputVolume: (volume: number) => void;
  setInputDevice: (deviceId: string) => Promise<void>;
  setOutputDevice: (deviceId: string) => Promise<void>;
  refreshAudioDevices: () => Promise<void>;
}

export function useVoiceRoom(
  roomId: string | number,
  userId: number,
  token: string,
): VoiceRoomState {
  const iceServers = useRef<RTCIceServer[]>([
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ]);

  if (typeof window !== "undefined") {
    const rawIceServers = process.env.NEXT_PUBLIC_WEBRTC_ICE_SERVERS;
    if (rawIceServers) {
      try {
        const parsed = JSON.parse(rawIceServers) as RTCIceServer[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          iceServers.current = parsed;
        }
      } catch {
        // Keep default STUN servers if env parsing fails.
      }
    }
  }

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  // Default voice state on join: muted + deafened until user opts in.
  const [isMuted, setIsMuted] = useState(true);
  const [isDeafened, setIsDeafened] = useState(true);
  const [inputVolume, setInputVolumeState] = useState(1);
  const [outputVolume, setOutputVolumeState] = useState(1);
  const [selectedInputDeviceId, setSelectedInputDeviceId] = useState<
    string | null
  >(null);
  const [selectedOutputDeviceId, setSelectedOutputDeviceId] = useState<
    string | null
  >(null);
  const [availableInputDevices, setAvailableInputDevices] = useState<
    MediaDeviceInfo[]
  >([]);
  const [availableOutputDevices, setAvailableOutputDevices] = useState<
    MediaDeviceInfo[]
  >([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speakingUsers, setSpeakingUsers] = useState<Set<number>>(new Set());
  const [voiceParticipants, setVoiceParticipants] = useState<Set<number>>(
    new Set(),
  );
  const [mutedUsers, setMutedUsers] = useState<Set<number>>(new Set());
  const [remoteStreams, setRemoteStreams] = useState<Map<number, MediaStream>>(
    new Map(),
  );

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const remoteAudioElsRef = useRef<Map<number, HTMLAudioElement>>(new Map());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const speakingTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const tokenRef = useRef(token);
  const authRetryRef = useRef(false);

  const selectedInputDeviceIdRef = useRef<string | null>(null);
  const selectedOutputDeviceIdRef = useRef<string | null>(null);

  const outputVolumeRef = useRef(1);
  const inputVolumeRef = useRef(1);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    selectedInputDeviceIdRef.current = selectedInputDeviceId;
  }, [selectedInputDeviceId]);

  useEffect(() => {
    selectedOutputDeviceIdRef.current = selectedOutputDeviceId;
  }, [selectedOutputDeviceId]);

  useEffect(() => {
    outputVolumeRef.current = outputVolume;
    remoteAudioElsRef.current.forEach((audioEl) => {
      audioEl.volume = outputVolume;
    });
  }, [outputVolume]);

  useEffect(() => {
    inputVolumeRef.current = inputVolume;
  }, [inputVolume]);

  const refreshAudioDevices = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.enumerateDevices
    ) {
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === "audioinput");
      const outputs = devices.filter((d) => d.kind === "audiooutput");
      setAvailableInputDevices(inputs);
      setAvailableOutputDevices(outputs);

      if (!selectedInputDeviceIdRef.current && inputs[0]) {
        setSelectedInputDeviceId(inputs[0].deviceId);
      }
      if (!selectedOutputDeviceIdRef.current && outputs[0]) {
        setSelectedOutputDeviceId(outputs[0].deviceId);
      }
    } catch {
      // Ignore device listing errors (permissions/browser support).
    }
  }, []);

  const applyInputVolume = useCallback(async (stream: MediaStream) => {
    const target = Math.max(0, Math.min(1, inputVolumeRef.current));
    await Promise.all(
      stream.getAudioTracks().map(async (track) => {
        try {
          await track.applyConstraints({
            advanced: [{ volume: target } as MediaTrackConstraintSet],
          });
        } catch {
          // Not all browsers support volume constraint.
        }
      }),
    );
  }, []);

  const createLocalAudioStream = useCallback(async () => {
    const audio: MediaTrackConstraints = {
      ...(selectedInputDeviceIdRef.current
        ? { deviceId: { exact: selectedInputDeviceIdRef.current } }
        : {}),
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      audio,
      video: false,
    });
    await applyInputVolume(stream);
    return stream;
  }, [applyInputVolume]);

  const applyOutputDevice = useCallback(async (audioEl: HTMLAudioElement) => {
    const sinkId = selectedOutputDeviceIdRef.current;
    if (!sinkId) return;

    type AudioWithSink = HTMLAudioElement & {
      setSinkId?: (id: string) => Promise<void>;
    };

    const withSink = audioEl as AudioWithSink;
    if (!withSink.setSinkId) return;

    try {
      await withSink.setSinkId(sinkId);
    } catch {
      // Ignore unsupported or permission-blocked output routing.
    }
  }, []);

  const resolveWsBaseCandidates = useCallback(() => {
    const urls: string[] = [];
    const add = (value?: string) => {
      if (!value) return;
      const normalized = value.replace(/\/$/, "");
      if (!urls.includes(normalized)) urls.push(normalized);
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (apiUrl) {
      try {
        const parsed = new URL(apiUrl);
        const wsProtocol = parsed.protocol === "https:" ? "wss:" : "ws:";
        add(`${wsProtocol}//${parsed.host}`);
      } catch {
        // Ignore malformed env and continue with runtime candidates.
      }
    }

    if (typeof window !== "undefined") {
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      add(`${wsProtocol}//${window.location.host}`);
      add(`${wsProtocol}//${window.location.hostname}:8000`);
      add("ws://127.0.0.1:8000");
      add("ws://localhost:8000");
    }

    if (urls.length === 0) {
      add("ws://127.0.0.1:8000");
    }

    return urls;
  }, []);

  const openVoiceSocket = useCallback(
    async (
      authToken: string,
    ): Promise<{ ws: WebSocket; wsBaseUrl: string }> => {
      const candidates = resolveWsBaseCandidates();
      let lastError = "Connection error";

      type AttemptResult =
        | { ws: WebSocket; wsBaseUrl: string }
        | { fatalError: string }
        | null;

      for (const wsBaseUrl of candidates) {
        const wsUrl = `${wsBaseUrl}/api/v1/groups/${roomId}/voice?token=${encodeURIComponent(authToken)}`;

        const result = await new Promise<AttemptResult>((resolve) => {
          const ws = new WebSocket(wsUrl);
          let settled = false;

          const finish = (value: AttemptResult) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            resolve(value);
          };

          const timeoutId = setTimeout(() => {
            try {
              ws.close();
            } catch {
              // ignore close errors
            }
            finish(null);
          }, 4500);

          ws.onopen = () => {
            ws.onopen = null;
            ws.onerror = null;
            ws.onclose = null;
            finish({ ws, wsBaseUrl });
          };

          ws.onerror = () => {
            finish(null);
          };

          ws.onclose = (event) => {
            if (event.code === 4001) {
              finish({ fatalError: "Voice auth failed (invalid token)" });
              return;
            }
            if (event.code === 4002) {
              finish({
                fatalError: "You must join the room before voice chat",
              });
              return;
            }
            finish(null);
          };
        });

        if (result && "ws" in result) {
          return result;
        }

        if (result && "fatalError" in result) {
          throw new Error(result.fatalError);
        }

        lastError = `Connection error (${wsBaseUrl})`;
      }

      throw new Error(lastError);
    },
    [roomId, resolveWsBaseCandidates],
  );

  const resolveVoiceToken = useCallback(async (forceRefresh = false) => {
    let current = tokenRef.current?.trim() ?? "";

    if (current && !forceRefresh) {
      return current;
    }

    try {
      if (forceRefresh) {
        const { data } = await supabase.auth.refreshSession();
        current = data.session?.access_token?.trim() ?? "";
      } else {
        const { data } = await supabase.auth.getSession();
        current = data.session?.access_token?.trim() ?? "";
        if (!current) {
          const refreshed = await supabase.auth.refreshSession();
          current = refreshed.data.session?.access_token?.trim() ?? "";
        }
      }
    } catch {
      current = "";
    }

    tokenRef.current = current;
    return current;
  }, []);

  const attachRemoteAudio = useCallback(
    (remoteUserId: number, remoteStream: MediaStream) => {
      let audioEl = remoteAudioElsRef.current.get(remoteUserId);
      if (!audioEl) {
        audioEl = new Audio();
        audioEl.autoplay = true;
        audioEl.preload = "auto";
        audioEl.setAttribute("playsinline", "true");
        remoteAudioElsRef.current.set(remoteUserId, audioEl);
      }

      if (audioEl.srcObject !== remoteStream) {
        audioEl.srcObject = remoteStream;
      }

      audioEl.muted = isDeafened;
      audioEl.volume = outputVolumeRef.current;
      void applyOutputDevice(audioEl);

      const playPromise = audioEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Playback can fail before the browser grants media playback permissions.
        });
      }
    },
    [isDeafened, applyOutputDevice],
  );

  const cleanupRemoteAudio = useCallback((remoteUserId: number) => {
    const audioEl = remoteAudioElsRef.current.get(remoteUserId);
    if (!audioEl) return;
    audioEl.pause();
    audioEl.srcObject = null;
    remoteAudioElsRef.current.delete(remoteUserId);
  }, []);

  // Deterministic offerer selection prevents "offer glare" when both peers join together.
  const shouldInitiateOffer = useCallback(
    (remoteUserId: number) => userId < remoteUserId,
    [userId],
  );

  // ── Voice activity detection (VAD) on local mic ──────────────────────────
  const startVAD = useCallback(
    (stream: MediaStream) => {
      try {
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;

        let lastIsSpeaking = false;
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(buf);
          const avg = buf.reduce((a, b) => a + b, 0) / buf.length;

          // Send speaking state via WebSocket only on change
          const isSpeaking = avg > 12;
          if (isSpeaking !== lastIsSpeaking) {
            lastIsSpeaking = isSpeaking;
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "speaking",
                  payload: { is_speaking: isSpeaking },
                }),
              );
            }

            // Local speaking indicator
            setSpeakingUsers((prev) => {
              const next = new Set(prev);
              if (isSpeaking) next.add(userId);
              else next.delete(userId);
              return next;
            });
          }

          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        // AudioContext may not be available in all environments — ignore silently
      }
    },
    [userId],
  );

  // ── Create RTCPeerConnection for a remote user ──────────────────────────
  const createPeerConnection = useCallback(
    async (remoteUserId: number): Promise<RTCPeerConnection> => {
      const pc = new RTCPeerConnection({
        iceServers: iceServers.current,
      });

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") {
          setError("Peer connection failed. TURN relay may be required.");
        }
      };

      // Handle incoming tracks
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (remoteStream) {
          setRemoteStreams((prev) =>
            new Map(prev).set(remoteUserId, remoteStream),
          );
          attachRemoteAudio(remoteUserId, remoteStream);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "signal",
              payload: {
                target_user_id: remoteUserId,
                signal_type: "ice_candidate",
                data: event.candidate,
              },
            }),
          );
        }
      };

      // Add local stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, streamRef.current!);
        });
      }

      peerConnectionsRef.current.set(remoteUserId, pc);
      return pc;
    },
    [attachRemoteAudio],
  );

  // ── Handle incoming WebSocket messages ────────────────────────────────
  const handleWebSocketMessage = useCallback(
    async (message: { type: string; payload: Record<string, unknown> }) => {
      const { type, payload } = message;

      switch (type) {
        case "voice_participants":
          // New participants joined - initiate connection to each
          const participants: number[] =
            (payload.participants as number[]) || [];
          setVoiceParticipants(() => {
            const next = new Set<number>([userId]);
            participants.forEach((id) => next.add(id));
            return next;
          });
          for (const remoteUserId of participants) {
            if (!shouldInitiateOffer(remoteUserId)) continue;
            if (!peerConnectionsRef.current.has(remoteUserId)) {
              const pc = await createPeerConnection(remoteUserId);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);

              wsRef.current?.send(
                JSON.stringify({
                  type: "signal",
                  payload: {
                    target_user_id: remoteUserId,
                    signal_type: "offer",
                    data: offer,
                  },
                }),
              );
            }
          }
          break;

        case "user_joined_voice":
          // New user joined - initiate connection
          const newUserId = payload.user_id as number;
          setVoiceParticipants((prev) => {
            const next = new Set(prev);
            next.add(newUserId);
            return next;
          });
          if (!shouldInitiateOffer(newUserId)) break;
          if (!peerConnectionsRef.current.has(newUserId)) {
            const pc = await createPeerConnection(newUserId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            wsRef.current?.send(
              JSON.stringify({
                type: "signal",
                payload: {
                  target_user_id: newUserId,
                  signal_type: "offer",
                  data: offer,
                },
              }),
            );
          }
          break;

        case "user_left_voice":
          // User left - cleanup connection
          const leftUserId = payload.user_id as number;
          setVoiceParticipants((prev) => {
            const next = new Set(prev);
            next.delete(leftUserId);
            return next;
          });
          const pc = peerConnectionsRef.current.get(leftUserId);
          if (pc) {
            pc.close();
            peerConnectionsRef.current.delete(leftUserId);
          }
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.delete(leftUserId);
            return next;
          });
          cleanupRemoteAudio(leftUserId);
          setSpeakingUsers((prev) => {
            const next = new Set(prev);
            next.delete(leftUserId);
            return next;
          });
          setMutedUsers((prev) => {
            const next = new Set(prev);
            next.delete(leftUserId);
            return next;
          });
          break;

        case "signal":
          // WebRTC signaling
          const { from_user_id, signal_type, data } = payload as {
            from_user_id: number;
            signal_type: string;
            data: RTCSessionDescriptionInit;
          };
          const remotePc = peerConnectionsRef.current.get(from_user_id);

          if (!remotePc) {
            // Create connection if it doesn't exist
            const pc = await createPeerConnection(from_user_id);
            if (signal_type === "offer") {
              await pc.setRemoteDescription(
                new RTCSessionDescription(data as RTCSessionDescriptionInit),
              );
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              wsRef.current?.send(
                JSON.stringify({
                  type: "signal",
                  payload: {
                    target_user_id: from_user_id,
                    signal_type: "answer",
                    data: answer,
                  },
                }),
              );
            } else if (signal_type === "ice_candidate") {
              await pc.addIceCandidate(
                new RTCIceCandidate(data as unknown as RTCLocalIceCandidateInit),
              );
            }
          } else {
            if (signal_type === "offer") {
              if (remotePc.signalingState !== "stable") {
                // Ignore colliding offers; deterministic initiator rule handles negotiation.
                break;
              }
              await remotePc.setRemoteDescription(
                new RTCSessionDescription(data),
              );
              const answer = await remotePc.createAnswer();
              await remotePc.setLocalDescription(answer);

              wsRef.current?.send(
                JSON.stringify({
                  type: "signal",
                  payload: {
                    target_user_id: from_user_id,
                    signal_type: "answer",
                    data: answer,
                  },
                }),
              );
            } else if (signal_type === "answer") {
              await remotePc.setRemoteDescription(
                new RTCSessionDescription(data as RTCSessionDescriptionInit),
              );
            } else if (signal_type === "ice_candidate") {
              await remotePc.addIceCandidate(
                new RTCIceCandidate(data as RTCLocalIceCandidateInit),
              );
            }
          }
          break;

        case "voice_error":
          setError((payload.message as string) || "Voice connection failed");
          break;

        case "mute_toggle":
          // Update mute state for remote user
          const muteUserId = payload.user_id as number;
          setMutedUsers((prev) => {
            const next = new Set(prev);
            if (payload.is_muted as boolean) next.add(muteUserId);
            else next.delete(muteUserId);
            return next;
          });
          setSpeakingUsers((prev) => {
            const next = new Set(prev);
            if (payload.is_muted as boolean) {
              next.delete(muteUserId);
            }
            return next;
          });
          break;

        case "speaking":
          // Update speaking state for remote user
          const speakUserId = payload.user_id as number;
          setSpeakingUsers((prev) => {
            const next = new Set(prev);
            if (payload.is_speaking as boolean) {
              next.add(speakUserId);
              // Clear existing timeout
              const existingTimeout =
                speakingTimeoutRef.current.get(speakUserId);
              if (existingTimeout) clearTimeout(existingTimeout);

              // Set timeout to remove speaking status after silence
              speakingTimeoutRef.current.set(
                speakUserId,
                setTimeout(() => {
                  next.delete(speakUserId);
                  setSpeakingUsers(new Set(next));
                }, 500),
              );
            } else {
              next.delete(speakUserId);
            }
            return next;
          });
          break;
      }
    },
    [createPeerConnection, cleanupRemoteAudio, shouldInitiateOffer, userId],
  );

  // ── Connect ───────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    setError(null);

    const authToken = await resolveVoiceToken();
    if (!authToken) {
      setError("Missing auth token for voice connection");
      setIsConnecting(false);
      return;
    }

    try {
      // Ensure membership is persisted before websocket auth gate checks it.
      try {
        await apiPost(`/api/v1/groups/${roomId}/join`);
      } catch {
        // Ignore non-fatal join fallback errors (already joined, etc.)
      }

      // Get local media stream
      const stream = await createLocalAudioStream();
      streamRef.current = stream;
      setLocalStream(stream);
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
      startVAD(stream);

      // Connect to WebSocket signaling server
      const { ws, wsBaseUrl } = await openVoiceSocket(authToken);
      wsRef.current = ws;

      authRetryRef.current = false;
      setIsConnected(true);
      setIsConnecting(false);
      setVoiceParticipants(new Set([userId]));
      setMutedUsers((prev) => {
        const next = new Set(prev);
        if (isMuted) next.add(userId);
        else next.delete(userId);
        return next;
      });

      // Broadcast initial local mute state so others render status correctly.
      ws.send(
        JSON.stringify({
          type: "mute_toggle",
          payload: { is_muted: isMuted },
        }),
      );

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          void handleWebSocketMessage(message).catch((err) => {
            console.error("Voice signaling message failed:", err);
          });
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError(`Connection error (${wsBaseUrl})`);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        setVoiceParticipants(new Set());

        if (event.code === 4001) {
          if (!authRetryRef.current) {
            authRetryRef.current = true;
            void (async () => {
              const refreshedToken = await resolveVoiceToken(true);
              if (refreshedToken) {
                await connect();
              } else {
                setError("Voice auth failed (invalid token)");
              }
            })();
            return;
          }
          setError("Voice auth failed (invalid token)");
        } else if (event.code === 4002) {
          setError("You must join the room before voice chat");
        } else if (event.code !== 1000 && event.reason) {
          setError(event.reason);
        } else if (event.code !== 1000) {
          if (event.code === 1006) {
            setError(
              "Voice socket closed (code 1006) - check backend URL/network",
            );
          } else {
            setError(`Voice socket closed (code ${event.code})`);
          }
        }
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Microphone access denied";
      setError(message);
      setIsConnecting(false);
    }
  }, [
    isConnected,
    isConnecting,
    roomId,
    isMuted,
    userId,
    startVAD,
    handleWebSocketMessage,
    createLocalAudioStream,
    resolveVoiceToken,
    openVoiceSocket,
  ]);

  // ── Disconnect ────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    // Close WebSocket
    wsRef.current?.close();
    wsRef.current = null;

    // Stop local stream
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLocalStream(null);

    // Stop and release remote audio outputs
    remoteAudioElsRef.current.forEach((audioEl) => {
      audioEl.pause();
      audioEl.srcObject = null;
    });
    remoteAudioElsRef.current.clear();

    // Cleanup VAD
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    analyserRef.current?.disconnect();
    audioCtxRef.current?.close().catch(() => { });
    audioCtxRef.current = null;
    analyserRef.current = null;

    // Clear speaking timeouts
    speakingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    speakingTimeoutRef.current.clear();

    // Reset state
    setSpeakingUsers(new Set());
    setVoiceParticipants(new Set());
    setMutedUsers(new Set());
    setRemoteStreams(new Map());
    setIsConnected(false);
    setIsMuted(true);
    setIsDeafened(true);
  }, []);

  // ── Mute toggle ───────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (!isConnected) {
      setError("Please establish connection first");
      return;
    }

    setIsMuted((prev) => {
      const next = !prev;
      streamRef.current?.getAudioTracks().forEach((t) => {
        t.enabled = !next;
      });

      setMutedUsers((prevMuted) => {
        const updated = new Set(prevMuted);
        if (next) updated.add(userId);
        else updated.delete(userId);
        return updated;
      });

      // Broadcast mute state via WebSocket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "mute_toggle",
            payload: { is_muted: next },
          }),
        );
      }

      return next;
    });
  }, [isConnected, userId]);

  const setInputVolume = useCallback(
    (volume: number) => {
      const next = Math.max(0, Math.min(1, volume));
      setInputVolumeState(next);
      const stream = streamRef.current;
      if (!stream) return;
      void applyInputVolume(stream);
    },
    [applyInputVolume],
  );

  const setOutputVolume = useCallback((volume: number) => {
    const next = Math.max(0, Math.min(1, volume));
    setOutputVolumeState(next);
  }, []);

  const setOutputDevice = useCallback(
    async (deviceId: string) => {
      setSelectedOutputDeviceId(deviceId);
      selectedOutputDeviceIdRef.current = deviceId;
      await Promise.all(
        Array.from(remoteAudioElsRef.current.values()).map((audioEl) =>
          applyOutputDevice(audioEl),
        ),
      );
    },
    [applyOutputDevice],
  );

  const setInputDevice = useCallback(
    async (deviceId: string) => {
      setSelectedInputDeviceId(deviceId);
      selectedInputDeviceIdRef.current = deviceId;

      if (!isConnected) return;

      try {
        const replacementStream = await createLocalAudioStream();
        const newTrack = replacementStream.getAudioTracks()[0];
        if (!newTrack) return;

        await Promise.all(
          Array.from(peerConnectionsRef.current.values()).map(async (pc) => {
            const sender = pc
              .getSenders()
              .find((s) => s.track && s.track.kind === "audio");
            if (sender) await sender.replaceTrack(newTrack);
          }),
        );

        const oldStream = streamRef.current;
        streamRef.current = replacementStream;
        setLocalStream(replacementStream);

        oldStream?.getTracks().forEach((track) => track.stop());

        // Restart VAD with the new input stream.
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        analyserRef.current?.disconnect();
        audioCtxRef.current?.close().catch(() => { });
        audioCtxRef.current = null;
        analyserRef.current = null;
        startVAD(replacementStream);

        // Preserve mute state after device switch.
        replacementStream.getAudioTracks().forEach((track) => {
          track.enabled = !isMuted;
        });
      } catch {
        setError("Failed to switch microphone device");
      }
    },
    [isConnected, createLocalAudioStream, startVAD, isMuted],
  );

  // ── Deafen toggle (speaker on/off) ──────────────────────────────────────
  const toggleDeafen = useCallback(() => {
    setIsDeafened((prev) => {
      const next = !prev;
      remoteAudioElsRef.current.forEach((audioEl) => {
        audioEl.muted = next;
        if (!next) {
          const playPromise = audioEl.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
              // Ignore play errors; user can retry by toggling speaker.
            });
          }
        }
      });
      return next;
    });
  }, []);

  useEffect(() => {
    remoteStreams.forEach((stream, remoteUserId) => {
      attachRemoteAudio(remoteUserId, stream);
    });
  }, [remoteStreams, attachRemoteAudio]);

  useEffect(() => {
    void refreshAudioDevices();

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.addEventListener
    ) {
      return;
    }

    const handleDeviceChange = () => {
      void refreshAudioDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, [refreshAudioDevices]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (isConnected) disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return {
    isConnected,
    isConnecting,
    isMuted,
    isDeafened,
    inputVolume,
    outputVolume,
    selectedInputDeviceId,
    selectedOutputDeviceId,
    availableInputDevices,
    availableOutputDevices,
    localStream,
    error,
    speakingUsers,
    voiceParticipants,
    mutedUsers,
    remoteStreams,
    connect,
    disconnect,
    toggleMute,
    toggleDeafen,
    setInputVolume,
    setOutputVolume,
    setInputDevice,
    setOutputDevice,
    refreshAudioDevices,
  };
}
