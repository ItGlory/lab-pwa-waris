'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  ProcessingStage,
  ProcessingStats,
} from '@/components/pdf/pdf-upload-progress';

interface ProgressEvent {
  type: 'progress';
  stage: ProcessingStage;
  percent: number;
  message: string;
  message_th: string;
  stats?: Record<string, number>;
  timestamp: string;
}

interface CompleteEvent {
  type: 'complete';
  success: boolean;
  filename: string;
  stats: ProcessingStats;
  message: string;
  message_th: string;
  timestamp: string;
}

interface ErrorEvent {
  type: 'error';
  message: string;
  message_th: string;
  timestamp?: string;
}

type SSEEvent = ProgressEvent | CompleteEvent | ErrorEvent;

interface UsePDFUploadOptions {
  onProgress?: (event: ProgressEvent) => void;
  onComplete?: (event: CompleteEvent) => void;
  onError?: (error: Error) => void;
}

export function usePDFUpload(options: UsePDFUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState<ProcessingStage | null>(
    null
  );
  const [stageProgress, setStageProgress] = useState<
    Record<ProcessingStage, number>
  >({
    extract: 0,
    chunk: 0,
    embed: 0,
    store: 0,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [stats, setStats] = useState<ProcessingStats>();
  const [filename, setFilename] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const reset = useCallback(() => {
    setIsUploading(false);
    setCurrentStage(null);
    setStageProgress({
      extract: 0,
      chunk: 0,
      embed: 0,
      store: 0,
    });
    setIsComplete(false);
    setIsError(false);
    setErrorMessage(undefined);
    setStats(undefined);
    setFilename('');
  }, []);

  const uploadPDF = useCallback(
    async (file: File, category: string = 'document', title?: string) => {
      if (isUploading) return;

      reset();
      setIsUploading(true);
      setFilename(file.name);

      abortControllerRef.current = new AbortController();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      if (title) {
        formData.append('title', title);
      }

      try {
        const response = await fetch(`${apiUrl}/api/v1/pdf/upload/stream`, {
          method: 'POST',
          body: formData,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail?.message_th ||
              errorData.detail?.message ||
              `HTTP ${response.status}`
          );
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process SSE events
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event: SSEEvent = JSON.parse(line.slice(6));

                if (event.type === 'progress') {
                  setCurrentStage(event.stage);
                  setStageProgress((prev) => ({
                    ...prev,
                    [event.stage]: event.percent,
                  }));
                  options.onProgress?.(event);
                } else if (event.type === 'complete') {
                  if (event.success) {
                    setIsComplete(true);
                    setStats(event.stats);
                    setCurrentStage(null);
                    // Mark all stages as 100%
                    setStageProgress({
                      extract: 100,
                      chunk: 100,
                      embed: 100,
                      store: 100,
                    });
                    options.onComplete?.(event);
                  } else {
                    setIsError(true);
                    setErrorMessage(event.message_th || event.message);
                    options.onError?.(new Error(event.message));
                  }
                } else if (event.type === 'error') {
                  setIsError(true);
                  setErrorMessage(event.message_th || event.message);
                  options.onError?.(new Error(event.message));
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Unknown error';
        setIsError(true);
        setErrorMessage(message);
        options.onError?.(error instanceof Error ? error : new Error(message));
      } finally {
        setIsUploading(false);
        abortControllerRef.current = null;
      }
    },
    [isUploading, apiUrl, reset, options]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
    }
  }, []);

  return {
    uploadPDF,
    cancel,
    reset,
    isUploading,
    currentStage,
    stageProgress,
    isComplete,
    isError,
    errorMessage,
    stats,
    filename,
  };
}
