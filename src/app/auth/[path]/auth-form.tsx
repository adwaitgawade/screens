'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BorderBeam } from '@/components/ui/border-beam';
import { Spotlight } from '@/components/ui/spotlight';
import { Loader2, Github, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';

interface AuthFormProps {
    path: string;
}

export function AuthForm({ path }: AuthFormProps) {
    const router = useRouter();
    const isSignIn = path === 'sign-in';

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignIn) {
                const { error: signInError } = await authClient.signIn.email({
                    email,
                    password,
                    callbackURL: '/',
                });
                if (signInError) throw new Error(signInError.message || 'Failed to sign in');
            } else {
                const { error: signUpError } = await authClient.signUp.email({
                    email,
                    password,
                    name,
                    callbackURL: '/',
                });
                if (signUpError) throw new Error(signUpError.message || 'Failed to sign up');
            }
            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialAuth = async (provider: 'github' | 'google') => {
        setError(`${provider} login is not yet configured.`);
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background p-4">
            {/* Background Effects */}
            <Spotlight />
            <div className="absolute inset-0 bg-dot-white/[0.2] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={path}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-md"
                >
                    <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl">
                        <BorderBeam size={250} duration={12} delay={9} />

                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-3xl font-bold tracking-tight text-white">
                                {isSignIn ? 'Welcome Back' : 'Create Account'}
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                {isSignIn
                                    ? 'Enter your credentials to access your account'
                                    : 'Join us to start generating beautiful mobile UI'
                                }
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-4">
                            <form onSubmit={handleSubmit} className="grid gap-4">
                                {!isSignIn && (
                                    <div className="grid gap-2">
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                            <Input
                                                id="name"
                                                placeholder="Full Name"
                                                type="text"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                required
                                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                        <Input
                                            id="email"
                                            placeholder="name@example.com"
                                            type="email"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect="off"
                                            required
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                        <Input
                                            id="password"
                                            placeholder="Password"
                                            type="password"
                                            autoComplete={isSignIn ? "current-password" : "new-password"}
                                            required
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="text-sm font-medium text-red-500 text-center"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-black hover:bg-zinc-200 transition-colors"
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        isSignIn ? 'Sign In' : 'Sign Up'
                                    )}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#09090b] px-2 text-zinc-500 leading-none">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    onClick={() => handleSocialAuth('github')}
                                >
                                    <Github className="mr-2 h-4 w-4" />
                                    Github
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    onClick={() => handleSocialAuth('google')}
                                >
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.909 3.292-2.09 4.313-1.617 1.4-3.554 2.145-6.75 2.145-5.32 0-9.28-4.307-9.28-9.627s3.96-9.627 9.28-9.627c3.15 0 5.4 1.238 7.02 2.748l2.31-2.31c-2.34-2.19-5.31-3.51-9.33-3.51-7.74 0-14.13 6.39-14.13 14.13s6.39 14.13 14.13 14.13c4.14 0 7.37-1.35 9.87-3.9 2.53-2.53 3.32-6.17 3.32-9.12 0-.87-.07-1.74-.21-2.58h-13.01z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Google
                                </Button>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4 text-center">
                            <p className="text-sm text-zinc-500">
                                {isSignIn ? "Don't have an account?" : "Already have an account?"}{' '}
                                <Link
                                    href={isSignIn ? '/auth/sign-up' : '/auth/sign-in'}
                                    className="text-white hover:underline transition-all"
                                >
                                    {isSignIn ? 'Sign Up' : 'Sign In'}
                                </Link>
                            </p>
                            <p className="px-8 text-center text-xs text-zinc-600">
                                By clicking continue, you agree to our{' '}
                                <Link href="/terms" className="underline underline-offset-4 hover:text-white">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
                                    Privacy Policy
                                </Link>
                                .
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
