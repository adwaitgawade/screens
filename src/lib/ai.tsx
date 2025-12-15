import { LanguageModel } from 'ai';
import { providerModels } from '@/config';
import { createVertex } from '@ai-sdk/google-vertex';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

type Provider = keyof typeof providerModels;

type ModelMap = { [P in Provider]: (typeof providerModels[P])[number] };

export const getAiModel = <P extends Provider>(provider: P, model: ModelMap[P]) => {
    if (provider == "google") {
        const vertex = createVertex({
            location: 'us-central1',
            project: 'dotted-clover-465411-t1',
            googleAuthOptions: {
                credentials: {
                    client_email: process.env.GOOGLE_API_EMAIL,
                    private_key: process.env.GOOGLE_API_KEY?.split(String.raw`\n`).join('\n'),
                },
            },
        });
        return vertex(model) as unknown as LanguageModel;
    } else if (provider == 'openrouter') {
        return openrouter.chat(model) as unknown as LanguageModel;
    }
    throw new Error(`Unsupported provider: ${provider}`);
}