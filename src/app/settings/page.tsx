'use client'

import { useRouter } from 'next/navigation'
import { Settings, User } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { AuthenticatedNavbar } from '@/components/authenticated-navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const SettingsPage = () => {
    const { data: session, isPending, error } = authClient.useSession();

    const router = useRouter()
    if (!session) {
        router.push("/auth/sign-in")
    }

    return (
        <div className="min-h-screen bg-background">
            <AuthenticatedNavbar>
                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex items-center gap-2 mb-8">
                            <Settings className="h-6 w-6 text-primary" />
                            <h1 className="text-3xl font-bold">Settings</h1>
                        </div>

                        {/* Account Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    <CardTitle>Account Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                                        <p className="text-sm font-mono">{session?.user.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">User ID</label>
                                        <p className="text-sm font-mono">{session?.user.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <p className="text-sm">{session?.user.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </AuthenticatedNavbar>
        </div>
    )
}

export default SettingsPage