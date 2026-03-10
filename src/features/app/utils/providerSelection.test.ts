import { describe, expect, it } from 'vitest';
import type { Provider } from '../hooks/useProviderConfig';
import { findProviderByModel, resolveProviderSelection } from './providerSelection';

const providers: Provider[] = [
  {
    id: 'anthropic',
    name: 'anthropic',
    displayName: 'Anthropic',
    models: ['claude-1', 'claude-2'],
    defaultModel: 'claude-2',
    configured: true,
  },
  {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    models: ['gpt-4o', 'o3-mini'],
    defaultModel: 'gpt-4o',
    configured: true,
  },
];

describe('provider selection helpers', () => {
  it('maps a selected model back to the provider that owns it', () => {
    expect(findProviderByModel(providers, 'o3-mini')?.id).toBe('openai');
  });

  it('keeps a valid selected model and aligns the provider automatically', () => {
    expect(resolveProviderSelection({
      providers,
      selectedProvider: 'anthropic',
      selectedModel: 'gpt-4o',
      defaultProvider: 'anthropic',
      defaultModel: 'claude-2',
    })).toEqual({
      providerId: 'openai',
      modelId: 'gpt-4o',
    });
  });

  it('falls back to the selected provider default when the chosen model is invalid', () => {
    expect(resolveProviderSelection({
      providers,
      selectedProvider: 'openai',
      selectedModel: 'missing-model',
      defaultProvider: 'anthropic',
      defaultModel: 'claude-2',
    })).toEqual({
      providerId: 'openai',
      modelId: 'gpt-4o',
    });
  });

  it('falls back to the first provider when nothing explicit is usable', () => {
    expect(resolveProviderSelection({
      providers,
      selectedProvider: '',
      selectedModel: '',
      defaultProvider: null,
      defaultModel: null,
    })).toEqual({
      providerId: 'anthropic',
      modelId: 'claude-2',
    });
  });
});
