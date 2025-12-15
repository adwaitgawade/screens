'use server';

import { getAiModel } from '@/lib/ai';
import { generateObject, jsonSchema } from 'ai';
import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { uploadWithServiceRole } from '@/lib/supabase/service';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { redirect } from 'next/navigation';
import { Langfuse, TextPromptClient } from 'langfuse';

type GenerateUIResult = {
    success: boolean;
    projectId?: string;
    error?: string;
};

const getLangfuseSystemPrompt = async (): Promise<{ prompt: string, fetchedPrompt: TextPromptClient }> => {
    const langfuse = new Langfuse();
    const prompt = await langfuse
        .getPrompt("appdraft-system", undefined, {
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

        // Get authenticated user
        console.log('[generateUIComponent] Getting current user');
        const user = await getCurrentUser();
        if (!user) {
            console.log('[generateUIComponent] User not authenticated');
            return { success: false, error: 'Not authenticated' };
        }

        const userId = user.id;
        console.log('[generateUIComponent] User authenticated', { userId });
        const supabase = await createClient();
        console.log('[generateUIComponent] Supabase client created');

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

            // Create project
            finalProjectId = crypto.randomUUID();
            console.log('[generateUIComponent] Generated project UUID', { finalProjectId });

            const { error: projectError } = await supabase.from('projects').insert([
                {
                    id: finalProjectId,
                    user_id: userId,
                    name: projectName,
                    description: prompt,
                    prompt: prompt,
                }
            ]);
            console.log('[generateUIComponent] Inserted project', { finalProjectId, projectError });

            if (projectError) {
                console.error('[generateUIComponent] Project creation error:', projectError);
                return { success: false, error: 'Failed to create project' };
            }

            // Verify project was created successfully before proceeding
            const { data: createdProject, error: verifyError } = await supabase
                .from('projects')
                .select('id, user_id')
                .eq('id', finalProjectId)
                .eq('user_id', userId)
                .single();
            console.log('[generateUIComponent] Verified project creation', { createdProject, verifyError });

            if (verifyError || !createdProject) {
                console.error('[generateUIComponent] Project verification error:', verifyError);
                return { success: false, error: 'Failed to verify project creation' };
            }
        } else {
            // Verify project exists and user has access
            console.log('[generateUIComponent] projectId provided, verifying access', { projectId });
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id')
                .eq('id', projectId)
                .eq('user_id', userId)
                .single();
            console.log('[generateUIComponent] Project access check', { project, projectError });

            if (projectError || !project) {
                console.log('[generateUIComponent] Project not found or access denied', { projectId });
                return { success: false, error: 'Project not found or access denied' };
            }

            // Update project's updated_at timestamp
            const { error: updateError } = await supabase
                .from('projects')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', projectId);
            console.log('[generateUIComponent] Updated project timestamp', { updateError });

            if (updateError) {
                console.error('[generateUIComponent] Project update error:', updateError);
            }
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
        console.log('[generateUIComponent] LLM schema defined');

        // Generate UI with LLM
        console.log('[generateUIComponent] Fetching system prompt from Langfuse');
        const { prompt: systemPrompt, fetchedPrompt } = await getLangfuseSystemPrompt();
        console.log('[generateUIComponent] System prompt fetched', { systemPrompt });
        console.log('[generateUIComponent] Calling generateObject for LLM UI generation');
        const { object: llmResult } = await generateObject({
            model: getAiModel('google', 'gemini-2.5-flash'),
            system: systemPrompt,
            prompt: prompt,
            schema: mobileUISchema,
            providerOptions: {
                google: {
                    thinkingConfig: {
                        includeThoughts: true,
                        //thinkingBudget: 2048,
                    },
                } satisfies GoogleGenerativeAIProviderOptions,
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
        console.log('[generateUIComponent] LLM result received', { llmResult });

        // Get the next order index for the screen
        console.log('[generateUIComponent] Fetching last screen order index');
        const { data: lastScreen, error: orderError } = await supabase
            .from('screens')
            .select('order_index')
            .eq('project_id', finalProjectId)
            .order('order_index', { ascending: false })
            .limit(1)
            .single();
        console.log('[generateUIComponent] Last screen order index', { lastScreen, orderError });

        const nextOrderIndex = lastScreen ? lastScreen.order_index + 1 : 0;
        console.log('[generateUIComponent] Next order index', { nextOrderIndex });

        // Store HTML in Supabase Storage using service role (bypasses RLS)
        const screenId = crypto.randomUUID();
        const versionId = crypto.randomUUID();
        const htmlFilePath = `projects/${finalProjectId}/screens/${screenId}/v1/index.html`;
        const htmlContent = llmResult.component.html;
        console.log('[generateUIComponent] Preparing to upload HTML', { htmlFilePath });

        const uploadResult = await uploadWithServiceRole(
            'html-files',
            htmlFilePath,
            htmlContent,
            'text/html'
        );
        console.log('[generateUIComponent] HTML upload result', { uploadResult });

        if (!uploadResult.success) {
            console.error('[generateUIComponent] Storage error:', uploadResult.error);
            return { success: false, error: 'Failed to upload HTML' };
        }

        // Create screen record
        console.log('[generateUIComponent] Inserting screen record', { screenId, finalProjectId, name: llmResult.component.name, nextOrderIndex });
        const { error: screenError } = await supabase.from('screens').insert([
            {
                id: screenId,
                project_id: finalProjectId,
                name: llmResult.component.name,
                order_index: nextOrderIndex,
            }
        ]);
        console.log('[generateUIComponent] Screen insert result', { screenError });

        if (screenError) {
            console.error('[generateUIComponent] Screen creation error:', screenError);
            return { success: false, error: 'Failed to create screen' };
        }

        // Create screen version record
        console.log('[generateUIComponent] Inserting screen version record', { versionId, screenId, htmlFilePath });
        const { error: versionError } = await supabase.from('screen_versions').insert([
            {
                id: versionId,
                screen_id: screenId,
                version_number: 1,
                user_prompt: prompt,
                ai_prompt: prompt,
                html_file_path: htmlFilePath,
                created_by: userId,
                is_current: true,
            }
        ]);
        console.log('[generateUIComponent] Screen version insert result', { versionError });

        if (versionError) {
            console.error('[generateUIComponent] Version creation error:', versionError);
            return { success: false, error: 'Failed to create screen version' };
        }

        console.log('[generateUIComponent] Returning success', { finalProjectId });

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