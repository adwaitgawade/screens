'use server';

import { getAiModel } from '@/lib/ai';
import { generateObject, jsonSchema } from 'ai';
import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { projects, screens, screenVersions, htmlContents } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Langfuse, TextPromptClient } from 'langfuse';

type GenerateUIResult = {
    success: boolean;
    projectId?: string;
    error?: string;
};

const getLangfuseSystemPrompt = async (): Promise<{ prompt: string, fetchedPrompt: TextPromptClient }> => {
    const langfuse = new Langfuse();
    const prompt = await langfuse
        .getPrompt("app-draft-grok", undefined, {
            label: "production",
        })
        .then((prompt) => {
            return { prompt: prompt.prompt, fetchedPrompt: prompt };
        });

    return prompt;
}

export async function generateUIComponent(prompt: string, projectId?: string): Promise<GenerateUIResult> {
    try {
        console.log('[generateUIComponent] Start', { prompt, projectId });
        // Input validation
        if (!prompt || prompt.trim().length === 0) {
            console.log('[generateUIComponent] No prompt provided');
            return { success: false, error: 'Prompt is required' };
        }

        if (prompt.length > 1000) {
            console.log('[generateUIComponent] Prompt too long', { length: prompt.length });
            return { success: false, error: 'Prompt is too long (max 1000 characters)' };
        }

        // Get authenticated user via Better Auth
        console.log('[generateUIComponent] Getting current user');
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            console.log('[generateUIComponent] User not authenticated');
            return { success: false, error: 'Not authenticated' };
        }

        const user = session.user;
        const userId = user.id;
        console.log('[generateUIComponent] User authenticated', { userId });

        let finalProjectId = projectId;

        // If no projectId provided, create a new project
        if (!projectId) {
            console.log('[generateUIComponent] No projectId provided, creating new project');
            // Generate unique project name
            const projectName = uniqueNamesGenerator({
                dictionaries: [adjectives, colors, animals],
                separator: '-',
                length: 3,
                style: 'lowerCase',
            });
            console.log('[generateUIComponent] Generated project name', { projectName });

            // Create project via Drizzle
            const [newProject] = await db.insert(projects).values({
                userId,
                name: projectName,
                description: prompt,
                prompt: prompt,
            }).returning({ id: projects.id });

            if (!newProject) {
                console.error('[generateUIComponent] Project creation failed');
                return { success: false, error: 'Failed to create project' };
            }

            finalProjectId = newProject.id;
            console.log('[generateUIComponent] Created project', { finalProjectId });
        } else {
            // Verify project exists and user has access
            console.log('[generateUIComponent] projectId provided, verifying access', { projectId });
            const [project] = await db
                .select({ id: projects.id })
                .from(projects)
                .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
                .limit(1);

            if (!project) {
                console.log('[generateUIComponent] Project not found or access denied', { projectId });
                return { success: false, error: 'Project not found or access denied' };
            }

            // Update project's updated_at timestamp
            await db
                .update(projects)
                .set({ updatedAt: new Date().toISOString() })
                .where(eq(projects.id, projectId));
        }

        // Define schema for LLM response
        console.log('[generateUIComponent] Defining LLM schema');
        const mobileUISchema = jsonSchema<{
            component: {
                name: string;
                description: string;
                html: string;
            };
        }>({
            type: 'object',
            properties: {
                component: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Name of the UI component'
                        },
                        description: {
                            type: 'string',
                            description: 'Brief description of the component'
                        },
                        html: {
                            type: 'string',
                            description: 'Complete HTML markup with Tailwind CSS classes'
                        }
                    },
                    required: ['name', 'description', 'html']
                }
            },
            required: ['component']
        });

        // Generate UI with LLM
        console.log('[generateUIComponent] Fetching system prompt from Langfuse');
        const { prompt: systemPrompt, fetchedPrompt } = await getLangfuseSystemPrompt();
        console.log('[generateUIComponent] Calling generateObject for LLM UI generation');
        const { object: llmResult } = await generateObject({
            model: getAiModel("openrouter", "openrouter/free"),
            system: systemPrompt,
            prompt: prompt,
            schema: mobileUISchema,
            providerOptions: {
                google: {
                    thinkingConfig: {
                        includeThoughts: true,
                    },
                } satisfies GoogleGenerativeAIProviderOptions,
                openrouter: {
                    enableThinking: true,
                }
            },
            experimental_telemetry: {
                isEnabled: true,
                metadata: {
                    langfusePrompt: fetchedPrompt.toJSON(),
                    userId: user.id,
                    userEmail: user.email || "No email",
                    projectId: finalProjectId || "No project id",
                }
            },
        });
        console.log('[generateUIComponent] LLM result received');

        // Get the next order index for the screen
        const [lastScreen] = await db
            .select({ orderIndex: screens.orderIndex })
            .from(screens)
            .where(eq(screens.projectId, finalProjectId!))
            .orderBy(desc(screens.orderIndex))
            .limit(1);

        const nextOrderIndex = lastScreen ? (lastScreen.orderIndex ?? 0) + 1 : 0;

        // Store HTML content in the database
        const htmlContent = llmResult.component.html;
        const [newHtmlContent] = await db
            .insert(htmlContents)
            .values({ html: htmlContent })
            .returning({ id: htmlContents.id });

        if (!newHtmlContent) {
            console.error('[generateUIComponent] Failed to store HTML content');
            return { success: false, error: 'Failed to store HTML content' };
        }

        // Create screen record
        const [newScreen] = await db
            .insert(screens)
            .values({
                projectId: finalProjectId!,
                name: llmResult.component.name,
                orderIndex: nextOrderIndex,
            })
            .returning({ id: screens.id });

        if (!newScreen) {
            console.error('[generateUIComponent] Screen creation failed');
            return { success: false, error: 'Failed to create screen' };
        }

        // Create screen version record
        const [newVersion] = await db
            .insert(screenVersions)
            .values({
                screenId: newScreen.id,
                versionNumber: 1,
                userPrompt: prompt,
                aiPrompt: prompt,
                htmlContentId: newHtmlContent.id,
                createdBy: userId,
                isCurrent: true,
            })
            .returning({ id: screenVersions.id });

        if (!newVersion) {
            console.error('[generateUIComponent] Version creation failed');
            return { success: false, error: 'Failed to create screen version' };
        }

        return {
            success: true,
            projectId: finalProjectId,
        };

    } catch (error) {
        console.error('[generateUIComponent] Generate UI error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
        };
    }
}

export async function generateUIAndRedirect(formData: FormData) {
    const prompt = formData.get('prompt') as string;
    const projectId = formData.get('projectId') as string | undefined;

    const result = await generateUIComponent(prompt, projectId);

    if (result.success && result.projectId) {
        redirect(`/project/${result.projectId}`);
    } else {
        throw new Error(result.error || 'Failed to generate UI');
    }
}