import { useState, useCallback } from "react";
import { apiUploadMedia, MediaUploadResponse } from "@/lib/api";

export interface MediaUploadState {
  uploading: boolean;
  error: string | null;
  progress: number; // 0-100
}

export function useMediaUpload() {
  const [state, setState] = useState<MediaUploadState>({
    uploading: false,
    error: null,
    progress: 0,
  });

  const uploadFile = useCallback(
    async (file: File): Promise<MediaUploadResponse> => {
      setState({ uploading: true, error: null, progress: 0 });

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setState((prev) => ({
            ...prev,
            progress: Math.min(prev.progress + 10, 90),
          }));
        }, 100);

        const result = await apiUploadMedia(file, "chat");

        clearInterval(progressInterval);
        setState({ uploading: false, error: null, progress: 100 });

        return result;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Upload failed";
        setState({ uploading: false, error: errorMsg, progress: 0 });
        throw err;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ uploading: false, error: null, progress: 0 });
  }, []);

  return { uploadFile, ...state, reset };
}
