import type { AIModel } from '@/types/ai';

export const formatPrompt = (template: string, variables: Record<string, any>) => {
  return template.replace(/\${(\w+)}/g, (_, key) => variables[key] || '');
};

export const extractCodeFromResponse = (response: string) => {
  const matches = response.match(/```[\s\S]*?```/g);
  if (!matches) return '';
  return matches[0]
    .replace(/```.*\n/, '')
    .replace(/```$/, '')
    .trim();
};

export const validateModel = (model: AIModel) => {
  const errors: string[] = [];
  
  if (!model.name) errors.push('Model name is required');
  if (!model.description) errors.push('Model description is required');
  if (!model.capabilities?.length) errors.push('At least one capability is required');
  
  if (model.parameters) {
    if (model.parameters.temperature < 0 || model.parameters.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }
    if (model.parameters.topP < 0 || model.parameters.topP > 1) {
      errors.push('Top P must be between 0 and 1');
    }
    if (model.parameters.maxTokens < 1) {
      errors.push('Max tokens must be greater than 0');
    }
  } else {
    errors.push('Model parameters are required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getDefaultModelParams = () => ({
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  presencePenalty: 0,
  frequencyPenalty: 0,
}); 