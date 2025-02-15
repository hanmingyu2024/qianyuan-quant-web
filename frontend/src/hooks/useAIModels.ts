import { useState, useEffect } from 'react';
import { message } from 'antd';
import type { AIModel } from '@/types/ai';

export const useAIModels = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:11434/api/models');
      const data = await response.json();
      setModels(data);
      if (data.length > 0) {
        setSelectedModel(data[0].id);
      }
    } catch (error) {
      message.error('Failed to fetch AI models');
    } finally {
      setLoading(false);
    }
  };

  const addModel = async (model: Omit<AIModel, 'id'>) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:11434/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model),
      });
      const newModel = await response.json();
      setModels(prev => [...prev, newModel]);
      message.success('Model added successfully');
    } catch (error) {
      message.error('Failed to add model');
    } finally {
      setLoading(false);
    }
  };

  const updateModel = async (id: string, updates: Partial<AIModel>) => {
    try {
      setLoading(true);
      await fetch(`http://localhost:11434/api/models/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      setModels(prev => 
        prev.map(model => 
          model.id === id ? { ...model, ...updates } : model
        )
      );
      message.success('Model updated successfully');
    } catch (error) {
      message.error('Failed to update model');
    } finally {
      setLoading(false);
    }
  };

  const deleteModel = async (id: string) => {
    try {
      setLoading(true);
      await fetch(`http://localhost:11434/api/models/${id}`, {
        method: 'DELETE',
      });
      setModels(prev => prev.filter(model => model.id !== id));
      message.success('Model deleted successfully');
    } catch (error) {
      message.error('Failed to delete model');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return {
    models,
    loading,
    selectedModel,
    setSelectedModel,
    addModel,
    updateModel,
    deleteModel,
    refreshModels: fetchModels,
  };
}; 