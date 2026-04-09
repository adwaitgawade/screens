import { LanguageModel } from 'ai';
import { providerModels } from '@/config';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

type Provider = keyof typeof providerModels;

type ModelMap = { [P in Provider]: (typeof providerModels[P])[number] };

export const getAiModel = <P extends Provider>(provider: P, model: ModelMap[P]) => {
    if (provider == 'openrouter') {
        return openrouter.chat(model) as unknown as LanguageModel;
    }
    throw new Error(`Unsupported provider: ${provider}`);
}