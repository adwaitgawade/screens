"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function LoginForm() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to home link */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to home
                    </Link>
                </div>

                {/* Login Card */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 blur-3xl rounded-full" />
                    <Card className="relative bg-slate-900/50 backdrop-blur-sm border-slate-700/50 shadow-2xl">
                        <CardHeader className="text-center pb-8">
                            {/* Logo */}
                            <div className="flex items-center justify-center space-x-2 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">AD</span>
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                                    AppDraft AI
                                </span>
                            </div>

                            <CardTitle className="text-2xl font-bold text-white mb-2">Welcome back</CardTitle>
                            <CardDescription className="text-slate-300 text-base">
                                Sign in to continue creating beautiful mobile UIs
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Sign In Button */}
                            <Button
                                onClick={() => router.push('/(auth)/sign-in')}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                            >
                                Sign in with Email
                            </Button>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-slate-900/50 text-slate-400">New to AppDraft AI?</span>
                                </div>
                            </div>

                            {/* Sign up link */}
                            <div className="text-center">
                                <p className="text-slate-400">
                                    Don&apos;t have an account?{" "}
                                    <Link
                                        href="/(auth)/sign-up"
                                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                    >
                                        Create one
                                    </Link>
                                </p>
                            </div>

                            {/* Benefits */}
                            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                                <div className="flex items-center mb-3">
                                    <Sparkles className="w-5 h-5 text-indigo-400 mr-2" />
                                    <span className="text-sm font-medium text-slate-200">What you&apos;ll get:</span>
                                </div>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    <li className="flex items-center">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3" />20 free mobile screens every month
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3" />
                                        AI-powered UI generation in 30 seconds
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3" />
                                        Export-ready designs and assets
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        By signing in, you agree to our{" "}
                        <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                    </p>
                </div>

                {/* Trust indicators */}
                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
                            Secure & Private
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                            10,000+ Users
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                            No Spam
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
