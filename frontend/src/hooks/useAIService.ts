import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { AIModel } from '@/types/ai';

interface UseAIServiceOptions {
  onError?: (error: Error) => void;
}

export const useAIService = (options: UseAIServiceOptions = {}) => {
  const [loading, setLoading] = useState(false);

  const generateStrategy = useCallback(async (prompt: string, model: AIModel) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.id,
          prompt,
          parameters: model.parameters,
        }),
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      options.onError?.(error as Error);
      message.error('Strategy generation failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeMarket = useCallback(async (data: any, model: AIModel) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:11434/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.id,
          data,
          parameters: model.parameters,
        }),
      });
      return await response.json();
    } catch (error) {
      options.onError?.(error as Error);
      message.error('Market analysis failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const optimizeStrategy = useCallback(async (config: any, model: AIModel) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:11434/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.id,
          config,
          parameters: model.parameters,
        }),
      });
      return await response.json();
    } catch (error) {
      options.onError?.(error as Error);
      message.error('Strategy optimization failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    generateStrategy,
    analyzeMarket,
    optimizeStrategy,
  };
}; 