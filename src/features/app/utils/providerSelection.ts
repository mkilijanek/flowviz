import type { Provider } from '../hooks/useProviderConfig';

interface ResolveProviderSelectionOptions {
  providers: Provider[];
  selectedProvider?: string;
  selectedModel?: string;
  defaultProvider?: string | null;
  defaultModel?: string | null;
}

export function findProviderByModel(providers: Provider[], model?: string | null): Provider | undefined {
  if (!model) {
    return undefined;
  }

  return providers.find((provider) => provider.models.includes(model));
}

export function resolveProviderSelection({
  providers,
  selectedProvider,
  selectedModel,
  defaultProvider,
  defaultModel,
}: ResolveProviderSelectionOptions): { providerId: string; modelId: string } {
  if (providers.length === 0) {
    return { providerId: '', modelId: '' };
  }

  const firstProvider = providers[0];
  const providerFromSelectedModel = findProviderByModel(providers, selectedModel);

  if (providerFromSelectedModel && selectedModel) {
    return {
      providerId: providerFromSelectedModel.id,
      modelId: selectedModel,
    };
  }

  const explicitProvider = providers.find((provider) => provider.id === selectedProvider);
  if (explicitProvider) {
    return {
      providerId: explicitProvider.id,
      modelId: explicitProvider.defaultModel,
    };
  }

  const providerFromDefaultModel = findProviderByModel(providers, defaultModel);
  if (providerFromDefaultModel && defaultModel) {
    return {
      providerId: providerFromDefaultModel.id,
      modelId: defaultModel,
    };
  }

  const defaultProviderRecord = providers.find((provider) => provider.id === defaultProvider);
  if (defaultProviderRecord) {
    return {
      providerId: defaultProviderRecord.id,
      modelId: defaultProviderRecord.defaultModel,
    };
  }

  return {
    providerId: firstProvider.id,
    modelId: firstProvider.defaultModel,
  };
}
