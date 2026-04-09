export const providerModels = {
    google: [
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        "claude-sonnet-4@20250514",
        "claude-opus-4@20250514",
        "claude-3-7-sonnet@20250219",
        "claude-3-5-sonnet-v2@20241022",
        "meta/llama-4-maverick-17b-128e-instruct-maas"
    ],
    groq: [
        'llama-3-groq-70b-tool',
    ],
    openrouter: [
        "minimax/minimax-m2.5:free",
        "z-ai/glm-4.5-air:free",
        "openrouter/free"
    ]
} as const;