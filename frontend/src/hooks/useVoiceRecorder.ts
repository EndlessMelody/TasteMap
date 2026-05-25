import { useState, useCallback, useRef, useEffect } from "react";

export interface VoiceRecorderState {
  isRecording: boolean;
  recordingTime: number; // seconds
  audioBlob: Blob | null;
  audioMimeType: string | null;
  error: string | null;
}

const RECORDER_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];

function getSupportedRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;

  return RECORDER_MIME_CANDIDATES.find((mimeType) => {
    try {
      return MediaRecorder.isTypeSupported(mimeType);
    } catch {
      return false;
    }
  });
}

function normalizeAudioMimeType(mimeType?: string | null): string {
  const normalized = mimeType?.split(";", 1)[0]?.trim()?.toLowerCase();
  return normalized || "audio/webm";
}

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    recordingTime: 0,
    audioBlob: null,
    audioMimeType: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const discardCurrentRecordingRef = useRef(false);
  const stopResultResolverRef = useRef<((blob: Blob | null) => void) | null>(
    null,
  );

  const clearRecordingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    let stream: MediaStream | null = null;

    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setState((prev) => ({
          ...prev,
          error: "Your browser does not support microphone recording.",
        }));
        return;
      }

      if (typeof MediaRecorder === "undefined") {
        setState((prev) => ({
          ...prev,
          error: "MediaRecorder is not available on this browser.",
        }));
        return;
      }

      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredMimeType = getSupportedRecorderMimeType();

      const mediaRecorder = preferredMimeType
        ? new MediaRecorder(stream, {
            mimeType: preferredMimeType,
          })
        : new MediaRecorder(stream);

      const recordingMimeType = normalizeAudioMimeType(
        mediaRecorder.mimeType || preferredMimeType,
      );

      discardCurrentRecordingRef.current = false;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const shouldDiscard = discardCurrentRecordingRef.current;
        discardCurrentRecordingRef.current = false;
        clearRecordingTimer();

        const resolveStopResult = (blob: Blob | null) => {
          if (stopResultResolverRef.current) {
            stopResultResolverRef.current(blob);
            stopResultResolverRef.current = null;
          }
        };

        if (shouldDiscard) {
          audioChunksRef.current = [];
          setState((prev) => ({
            ...prev,
            isRecording: false,
            recordingTime: 0,
            audioBlob: null,
            audioMimeType: null,
          }));

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

          resolveStopResult(null);
          return;
        }

        const audioBlob =
          audioChunksRef.current.length > 0
            ? new Blob(audioChunksRef.current, {
                type: recordingMimeType,
              })
            : null;
        audioChunksRef.current = [];

        if (audioBlob) {
          setState((prev) => ({
            ...prev,
            audioBlob,
            audioMimeType: recordingMimeType,
            isRecording: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isRecording: false,
            audioBlob: null,
            audioMimeType: null,
            error: "No audio captured. Try recording a little longer.",
          }));
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        resolveStopResult(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setState((prev) => ({
        ...prev,
        isRecording: true,
        recordingTime: 0,
        error: null,
        audioBlob: null,
        audioMimeType: recordingMimeType,
      }));

      // Start timer
      timerRef.current = window.setInterval(() => {
        setState((prev) => ({
          ...prev,
          recordingTime: prev.recordingTime + 1,
        }));
      }, 1000);
    } catch (err: unknown) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      streamRef.current = null;

      const errorMsg =
        err instanceof Error ? err.message : "Microphone access denied";
      setState((prev) => ({ ...prev, error: errorMsg }));
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      discardCurrentRecordingRef.current = false;
      clearRecordingTimer();

      return new Promise<Blob | null>((resolve) => {
        stopResultResolverRef.current = resolve;
        mediaRecorderRef.current?.stop();
      });
    }

    return null;
  }, []);

  const reset = useCallback(() => {
    clearRecordingTimer();
    discardCurrentRecordingRef.current = true;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    } else if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setState({
      isRecording: false,
      recordingTime: 0,
      audioBlob: null,
      audioMimeType: null,
      error: null,
    });

    if (stopResultResolverRef.current) {
      stopResultResolverRef.current(null);
      stopResultResolverRef.current = null;
    }

    audioChunksRef.current = [];
  }, []);

  // Cleanup strictly on unmount (avoid tearing down active stream on state transitions).
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        discardCurrentRecordingRef.current = true;
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (stopResultResolverRef.current) {
        stopResultResolverRef.current(null);
        stopResultResolverRef.current = null;
      }
    };
  }, []);

  return {
    startRecording,
    stopRecording,
    reset,
    ...state,
  };
}
