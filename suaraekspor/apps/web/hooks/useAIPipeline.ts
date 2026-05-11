'use client';
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface PipelineStatus {
  stage: string;
  progress: number;
  status: string;
}

export function useAIPipeline(productId: string | null) {
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);

  const poll = useCallback(async () => {
    if (!productId) return;
    try {
      const { data } = await apiClient.get(`/products/${productId}/status`);
      const status = data.data;
      setPipelineStatus(status);
      if (status.aiPipelineStage === 'done') {
        setIsComplete(true);
        return true; // Stop polling
      }
      if (status.aiPipelineStage === 'error') {
        setIsError(true);
        return true;
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
    return false;
  }, [productId]);

  useEffect(() => {
    if (!productId || isComplete || isError) return;
    const interval = setInterval(async () => {
      const done = await poll();
      if (done) clearInterval(interval);
    }, 2000); // Poll setiap 2 detik
    return () => clearInterval(interval);
  }, [productId, isComplete, isError, poll]);

  return { pipelineStatus, isComplete, isError };
}