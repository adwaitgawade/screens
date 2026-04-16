'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    ReactFlow,
    Node,
    Controls,
    Background,
    useNodesState,
    NodeTypes,
    BackgroundVariant,
    Handle,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import { ProjectScreen } from '@/lib/actions/screen-actions';
import { generateUIComponent } from '@/lib/actions/generate-ui';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface MobileUIData {
    title: string;
    html: string;
    onAddChild: (screenId: string) => void;
}

interface PromptInputData {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

interface SubScreenData {
    parentScreenId: string;
    onSubmit: (prompt: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const MobileUINode = ({ data }: { data: MobileUIData }) => {
    return (
        <div className='bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden'>
            <Handle type='target' position={Position.Left} className='!bg-purple-500 !w-3 !h-3' />
            <div className='bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-gray-800 truncate'>
                    {data.title}
                </h3>
                <Button
                    size='sm'
                    variant='outline'
                    onClick={() => data.onAddChild(data.title)}
                    className='ml-2 flex-shrink-0 h-7 text-xs'
                >
                    <Plus className='w-3 h-3 mr-1' />
                    Add Child
                </Button>
            </div>
            <div className='w-[414px] h-[896px] bg-white'>
                <iframe
                    src={`data:text/html,${encodeURIComponent(data.html)}`}
                    className='w-full h-full border-0'
                    title={data.title}
                    sandbox='allow-scripts'
                />
            </div>
            <Handle type='source' position={Position.Right} className='!bg-purple-500 !w-3 !h-3' />
        </div>
    );
};

const PromptInputNode = ({ data }: { data: PromptInputData }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = () => {
        if (prompt.trim() && !data.isLoading) {
            data.onSubmit(prompt.trim());
            setPrompt('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    };

    return (
        <div className='bg-white rounded-lg shadow-xl border-2 border-purple-200 overflow-hidden w-[400px]'>
            <div className='bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 border-b'>
                <h3 className='text-xl font-semibold text-white flex items-center gap-2'>
                    <Sparkles className='w-6 h-6' />
                    Generate New Screen
                </h3>
            </div>
            <div className='p-6 space-y-6'>
                <div className='space-y-3'>
                    <p className='text-base text-gray-600 font-medium'>
                        Describe your new screen
                    </p>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='Describe a new screen to add to this project... (e.g., A user profile page with avatar, name, and settings)'
                        className='text-background resize-none min-h-[160px] text-base leading-relaxed'
                        disabled={data.isLoading}
                    />
                    <p className='text-sm text-gray-500'>
                        Press Cmd/Ctrl + Enter to generate
                    </p>
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || data.isLoading}
                    className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12 text-lg font-medium'
                >
                    {data.isLoading ? (
                        <>
                            <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className='w-5 h-5 mr-2' />
                            Generate Screen
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

const SubScreenNode = ({ data }: { data: SubScreenData }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = () => {
        if (prompt.trim() && !data.isLoading) {
            data.onSubmit(prompt.trim());
            setPrompt('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    };

    return (
        <div className='bg-white rounded-lg shadow-xl border-2 border-green-200 overflow-hidden w-[400px]'>
            <div className='bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 border-b flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-white flex items-center gap-2'>
                    <Sparkles className='w-5 h-5' />
                    Add Screen On Top
                </h3>
                <Button
                    size='sm'
                    variant='ghost'
                    onClick={data.onCancel}
                    className='text-white hover:text-white hover:bg-green-600'
                >
                    <X className='w-4 h-4' />
                </Button>
            </div>
            <div className='p-4 space-y-4'>
                <div className='space-y-2'>
                    <p className='text-sm text-gray-600 font-medium'>
                        Describe what this screen should contain:
                    </p>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='e.g., A settings page with account options, notifications toggle, and logout button'
                        className='text-background resize-none min-h-[120px] text-sm'
                        disabled={data.isLoading}
                    />
                    <p className='text-xs text-gray-500'>
                        This screen will be created as a continuation of the parent screen
                    </p>
                </div>
                <div className='flex gap-2'>
                    <Button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || data.isLoading}
                        className='flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                        size='sm'
                    >
                        {data.isLoading ? (
                            <>
                                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className='w-4 h-4 mr-2' />
                                Generate
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={data.onCancel}
                        variant='outline'
                        size='sm'
                        disabled={data.isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

const nodeTypes: NodeTypes = {
    mobileUI: MobileUINode,
    subScreen: SubScreenNode,
};

interface SubScreenState {
    screenId: string;
    parentId: string;
    x: number;
    y: number;
}

const ProjectFlow = ({ screens, projectId }: { screens: ProjectScreen[]; projectId: string }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [subScreenStates, setSubScreenStates] = useState<SubScreenState[]>([]);
    const router = useRouter();

    const handleGenerateNewScreen = useCallback(async (prompt: string) => {
        setIsGenerating(true);
        try {
            const result = await generateUIComponent(prompt, projectId);

            if (result.success) {
                router.refresh();
            } else {
                console.error('Failed to generate screen:', result.error);
                alert(`Failed to generate screen: ${result.error}`);
            }
        } catch (error) {
            console.error('Error generating screen:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [projectId, router]);

    const handleGenerateChildScreen = useCallback(async (prompt: string, parentScreenId: string) => {
        setIsGenerating(true);
        try {
            const result = await generateUIComponent(prompt, projectId, parentScreenId);

            if (result.success) {
                // Clear the sub-screen state for this parent
                setSubScreenStates(prev => prev.filter(s => s.parentId !== parentScreenId));
                router.refresh();
            } else {
                console.error('Failed to generate child screen:', result.error);
                alert(`Failed to generate child screen: ${result.error}`);
            }
        } catch (error) {
            console.error('Error generating child screen:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [projectId, router]);

    const handleAddChildScreen = useCallback((parentScreenId: string) => {
        // Check if a sub-screen node already exists for this parent
        if (subScreenStates.some(s => s.parentId === parentScreenId)) {
            return;
        }

        // Find the parent screen's position
        const parentNode = nodes.find(n => n.id === parentScreenId);
        if (!parentNode) return;

        // Create a new sub-screen state positioned below and to the right of the parent
        const newSubScreen: SubScreenState = {
            screenId: `sub-${parentScreenId}-${Date.now()}`,
            parentId: parentScreenId,
            x: parentNode.position.x + 150,
            y: parentNode.position.y + 950,
        };

        setSubScreenStates(prev => [...prev, newSubScreen]);
    }, [nodes, subScreenStates]);

    const handleCancelSubScreen = useCallback((parentScreenId: string) => {
        setSubScreenStates(prev => prev.filter(s => s.parentId !== parentScreenId));
    }, []);

    useEffect(() => {
        // Create nodes for each screen
        const screenNodes: Node[] = screens.map((screen, index) => ({
            id: screen.id,
            type: 'mobileUI',
            position: { x: index * 550, y: 0 },
            data: {
                title: screen.name,
                html: screen.html,
                onAddChild: handleAddChildScreen,
            },
        }));

        // Add sub-screen nodes
        const subScreenNodes: Node[] = subScreenStates.map(subState => ({
            id: subState.screenId,
            type: 'subScreen',
            position: { x: subState.x, y: subState.y },
            data: {
                parentScreenId: subState.parentId,
                onSubmit: (prompt: string) => handleGenerateChildScreen(prompt, subState.parentId),
                onCancel: () => handleCancelSubScreen(subState.parentId),
                isLoading: isGenerating,
            },
        }));

        setNodes([...screenNodes, ...subScreenNodes]);
    }, [screens, subScreenStates, setNodes, handleAddChildScreen, handleGenerateChildScreen, handleCancelSubScreen, isGenerating]);

    return (
        <div className='w-full h-screen bg-gray-50 relative'>
            <div className='bg-gray-950 w-full h-10 flex items-center justify-between px-4'>
                <div className='text-white text-lg font-bold'>
                    <Link href='/'>AppDraft</Link>
                </div>
                <div className='text-white text-lg font-bold'>
                    <Link className={`${buttonVariants({ variant: 'outline' })}`} href='/profile'>
                        <span className='ml-2'>Profile</span>
                    </Link>
                </div>
            </div>
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 100 }}
                attributionPosition='bottom-left'
                proOptions={{
                    hideAttribution: true,
                }}
            >
                <Background
                    color='#000000'
                    variant={BackgroundVariant.Dots}
                    gap={30}
                />
                <Controls className='text-black' />
            </ReactFlow>

            {/* Fixed PromptInputNode in top right corner */}
            <div className='fixed top-12 right-2 z-50'>
                <Accordion type='single' collapsible defaultValue='prompt-input'>
                    <AccordionItem value='prompt-input'>
                        <AccordionTrigger>
                            Generate New Screen
                        </AccordionTrigger>
                        <AccordionContent>
                            <PromptInputNode
                                data={{
                                    onSubmit: handleGenerateNewScreen,
                                    isLoading: isGenerating,
                                }}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
};

export default ProjectFlow;