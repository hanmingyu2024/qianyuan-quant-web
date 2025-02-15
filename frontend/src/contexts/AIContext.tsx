import React, { createContext, useContext, useState } from 'react';
import { useAIModels } from '@/hooks/useAIModels';
import { useAIService } from '@/hooks/useAIService';
import type { AIModel } from '@/types/ai';

interface AIContextType {
  models: AIModel[];
  selectedModel: string;
  setSelectedModel: (id: string) => void;
  loading: boolean;
  generateStrategy: (prompt: string) => Promise<string>;
  analyzeMarket: (data: any) => Promise<any>;
  optimizeStrategy: (config: any) => Promise<any>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    models,
    loading: modelsLoading,
    selectedModel,
    setSelectedModel,
  } = useAIModels();

  const {
    loading: serviceLoading,
    generateStrategy: generate,
    analyzeMarket: analyze,
    optimizeStrategy: optimize,
  } = useAIService();

  const getSelectedModelConfig = () => {
    return models.find(m => m.id === selectedModel);
  };

  const generateStrategy = async (prompt: string) => {
    const model = getSelectedModelConfig();
    if (!model) throw new Error('No model selected');
    return generate(prompt, model);
  };

  const analyzeMarket = async (data: any) => {
    const model = getSelectedModelConfig();
    if (!model) throw new Error('No model selected');
    return analyze(data, model);
  };

  const optimizeStrategy = async (config: any) => {
    const model = getSelectedModelConfig();
    if (!model) throw new Error('No model selected');
    return optimize(config, model);
  };

  return (
    <AIContext.Provider
      value={{
        models,
        selectedModel,
        setSelectedModel,
        loading: modelsLoading || serviceLoading,
        generateStrategy,
        analyzeMarket,
        optimizeStrategy,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}; 