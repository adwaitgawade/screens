'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { AuthenticatedNavbar } from '@/components/authenticated-navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Settings, User } from 'lucide-react'

const SettingsPage = () => {
    const { user } = useAuth()

    if (!user) {
        return <div>Please log in to access settings.</div>
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
                                        <label className="text-sm font-medium text-muted-foreground">User ID</label>
                                        <p className="text-sm font-mono">{user.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <p className="text-sm">{user.email}</p>
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