import { AppNavbar } from "../navbar"
import { FeatureGrid } from "../feature-grid"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion"
import { Spotlight } from "../ui/spotlight"
import { GlowingEffect } from "../ui/glowing-effect"
import { Sparkles, Smartphone, Zap, Quote, User } from "lucide-react"
import Link from "next/link"

import { motion } from 'framer-motion';
import { Demo } from "../landing/demo"
import { Header } from "../landing/header"
import { FAQ } from "../landing/faq"
import { FinalCTA } from "../landing/final-cta"
import { Hero } from "../landing/hero"
import { ProblemSolution } from "../landing/problem-solution"
import { Features } from "../landing/features"
import { HowItWorks } from "../landing/how-it-works"
import { SocialProof } from "../landing/social-proof"
import { Pricing } from "../landing/pricing"
import { Footer } from "../landing/footer"

const TESTIMONIAL = {
    quote: "AppDraft AI is a game-changer. I generated beautiful mobile screens for my startup in minutes!",
    name: "Alex Kim",
    title: "Founder, UIverse",
}

const FAQS = [
    {
        q: "Is there a free plan?",
        a: "Yes! You can get started for free and generate screens with limited credits. Upgrade anytime for more features.",
    },
    {
        q: "Can I use the generated code in my projects?",
        a: "Absolutely. All generated HTML & Tailwind CSS is production-ready and yours to use.",
    },
    {
        q: "How does the AI work?",
        a: "Our AI is trained on thousands of mobile UI patterns and generates unique, responsive screens from your text prompts.",
    },
]

const LandingPage = () => {
    return (
        <>
            {/* <AppNavbar> */}
            <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
                <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-950 to-blue-900/20 pointer-events-none" />
                <div className="relative z-10">
                    <Header />
                    <main>
                        <Hero />
                        <ProblemSolution />
                        <Features />
                        <HowItWorks />
                        <Demo />
                        <SocialProof />
                        <Pricing />
                        <FAQ />
                        <FinalCTA />
                    </main>
                    <Footer />
                </div>
            </div>
            {/* </AppNavbar> */}
        </>
    )
}

export default LandingPage