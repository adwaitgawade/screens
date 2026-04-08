'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authClient } from '@/lib/auth-client'

type NeonAuthUser = {
    id: string
    name: string
    email: string
    image: string | null
}

type NeonAuthSession = {
    user: NeonAuthUser
}

type AuthContextType = {
    user: NeonAuthUser | null
    session: NeonAuthSession | null
    loading: boolean
    signOut: () => Promise<void>
    refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<NeonAuthUser | null>(null)
    const [session, setSession] = useState<NeonAuthSession | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchSession = useCallback(async () => {
        try {
            const { data } = await authClient.getSession()
            if (data?.session && data?.user) {
                const authUser: NeonAuthUser = {
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    image: data.user.image ?? null,
                }
                setUser(authUser)
                setSession({ user: authUser })
            } else {
                setUser(null)
                setSession(null)
            }
        } catch (error) {
            console.error('Error fetching session:', error)
            setUser(null)
            setSession(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSession()
    }, [fetchSession])

    const signOut = async () => {
        await authClient.signOut()
        setUser(null)
        setSession(null)
        window.location.href = '/'
    }

    const value: AuthContextType = {
        user,
        session,
        loading,
        signOut,
        refreshSession: fetchSession,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}