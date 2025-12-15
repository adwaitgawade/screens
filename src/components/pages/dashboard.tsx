import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PromptInput } from '@/components/prompt-input'
import { useAuth } from '@/components/auth/auth-provider'
import { generateUIComponent } from '@/lib/actions/generate-ui'
import { AuthenticatedNavbar } from '@/components/authenticated-navbar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown } from 'lucide-react'
import { CreditsExhaustedModal } from '@/components/ui/credits-exhausted-modal'

interface Project {
    id: string
    name: string
    description: string | null
    created_at: string
    updated_at: string
}

const Dashboard = () => {
    const [isGenerating, setIsGenerating] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [upgradeUrl, setUpgradeUrl] = useState<string | null>(null)
    const [showCreditsModal, setShowCreditsModal] = useState(false)
    const [modalCreditsRemaining, setModalCreditsRemaining] = useState(0)
    const [modalUpgradeUrl, setModalUpgradeUrl] = useState<string | null>(null)
    const { user } = useAuth()
    const router = useRouter()

    // Refactored fetchProjects function
    const fetchProjects = async (userId: string) => {
        setLoading(true)
        setError(null)
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('projects')
                .select('id, name, description, created_at, updated_at')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false })
            if (error) throw error
            setProjects(data || [])
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load projects')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchProjects(user.id)
        }
    }, [user])

    const handlePromptSubmit = async (prompt: string) => {
        setIsGenerating(true)
        setError(null)
        setUpgradeUrl(null)
        try {
            const result = await generateUIComponent(prompt)

            if (result.success) {
                if (user) await fetchProjects(user.id)
                if (result.projectId) {
                    router.push(`/project/${result.projectId}`)
                }
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

                        {/* Error Display with Upgrade Option */}
                        {error && (
                            <Card className="border-destructive">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="text-destructive">{error}</div>
                                        {upgradeUrl && (
                                            <Button
                                                onClick={() => window.location.href = upgradeUrl}
                                                className="flex items-center gap-1"
                                            >
                                                <Crown className="h-4 w-4" />
                                                Upgrade Now
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
                        </div>
                        {loading && <div>Loading projects...</div>}
                        {error && !upgradeUrl && <div className="text-red-500">{error}</div>}
                        {!loading && !error && projects.length === 0 && (
                            <div className="text-muted-foreground">No projects found. Start by generating one!</div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {projects.map((project) => (
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
                                                Last updated: {new Date(project.updated_at).toLocaleString()}
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </AuthenticatedNavbar>

            {/* Credits Exhausted Modal */}
            <CreditsExhaustedModal
                isOpen={showCreditsModal}
                onClose={() => setShowCreditsModal(false)}
                creditsRemaining={modalCreditsRemaining}
                upgradeUrl={modalUpgradeUrl || undefined}
            />
        </div>
    )
}

export default Dashboard;