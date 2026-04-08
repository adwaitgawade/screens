import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PromptInput } from '@/components/prompt-input'
import { useAuth } from '@/components/auth/auth-provider'
import { generateUIComponent } from '@/lib/actions/generate-ui'
import { getProjects } from '@/lib/actions/project-actions'
import { AuthenticatedNavbar } from '@/components/authenticated-navbar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface Project {
    id: string
    name: string
    description: string | null
    createdAt: string
    updatedAt: string
}

const Dashboard = () => {
    const [isGenerating, setIsGenerating] = useState(false)
    const [projectList, setProjectList] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()
    const router = useRouter()

    const fetchProjectList = async (userId: string) => {
        setLoading(true)
        setError(null)
        try {
            const data = await getProjects(userId)
            setProjectList(data || [])
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load projects')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchProjectList(user.id)
        }
    }, [user])

    const handlePromptSubmit = async (prompt: string) => {
        setIsGenerating(true)
        setError(null)
        try {
            const result = await generateUIComponent(prompt)

            if (result.success) {
                if (user) await fetchProjectList(user.id)
                if (result.projectId) {
                    router.push(`/project/${result.projectId}`)
                }
            } else {
                setError(result.error || 'Failed to generate UI')
            }
        } catch (error) {
            console.error('Error generating UI:', error)
            setError(error instanceof Error ? error.message : 'An unexpected error occurred')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <AuthenticatedNavbar>
                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Prompt Input Component */}
                        <PromptInput
                            onSubmit={handlePromptSubmit}
                            isLoading={isGenerating}
                        />

                        {/* Error Display */}
                        {error && (
                            <Card className="border-destructive">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="text-destructive">{error}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
                        </div>
                        {loading && <div>Loading projects...</div>}
                        {error && <div className="text-red-500">{error}</div>}
                        {!loading && !error && projectList.length === 0 && (
                            <div className="text-muted-foreground">No projects found. Start by generating one!</div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {projectList.map((project: Project) => (
                                <Card
                                    key={project.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <Link href={`/project/${project.id}`}>
                                        <CardHeader>
                                            <CardTitle>{project.name}</CardTitle>
                                            {project.description && (
                                                <CardDescription>{project.description}</CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-xs text-muted-foreground">
                                                Last updated: {new Date(project.updatedAt).toLocaleString()}
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </AuthenticatedNavbar>
        </div>
    )
}

export default Dashboard;