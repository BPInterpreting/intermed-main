'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Languages, Mic, BarChart3, Shield, Clock, Users, ArrowRight, CheckCircle2, ChevronRight, Globe, Headphones, Brain } from "lucide-react";


import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const }
  })
};

const features = [
  {
    icon: Brain,
    title: "AI Interpretation",
    description: "Real-time speech-to-speech interpretation and transcription powered by advanced AI for instant multilingual communication."
  },
  {
    icon: Users,
    title: "Human Interpreters",
    description: "Professional interpreters available on-demand or scheduled for complex, high-stakes encounters."
  },
  {
    icon: Globe,
    title: "200+ Languages",
    description: "Comprehensive language coverage ensuring no conversation is left without communication support."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Enterprise-grade security with end-to-end encryption and full HIPAA compliance for sensitive settings."
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Round-the-clock coverage with AI always available and human interpreters on standby."
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive usage tracking, session history, and reporting for organizational compliance."
  }
];

const plans = [
  {
    name: "AI Essential",
    description: "AI-powered interpretation for organizations needing instant access",
    features: ["Efatha Live AI interpretation", "Unlimited sessions", "Live transcripts", "Session history & analytics", "Email support"],
    cta: "Get Started",
    highlighted: false
  },
  {
    name: "Full Service",
    description: "AI + human interpreters for comprehensive language coverage",
    features: ["Everything in AI Essential", "Human interpreter scheduling", "Interpreter management", "Mobile app for interpreters", "Priority 24/7 support", "Custom language pairs"],
    cta: "Contact Sales",
    highlighted: true
  },
  {
    name: "Enterprise",
    description: "Custom solutions for large organizations and systems",
    features: ["Everything in Full Service", "Dedicated account manager", "Custom integrations", "SLA guarantees", "Compliance audit reports", "On-site training"],
    cta: "Contact Sales",
    highlighted: false
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient">
                {/* TODO: Add logo */}
              {/* <Languages className="h-5 w-5 text-accent-foreground" /> */}
            </div>
            <span className="font-display text-xl font-bold text-foreground">Efatha</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
            <Link href="/marketing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Interpreters</Link>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-accent-gradient text-accent-foreground hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="absolute inset-0 bg-hero opacity-[0.03]" />
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-ring" />
                Now available — AI-powered universal interpretation
              </span>
            </motion.div>
            <motion.h1
              className="mt-8 font-display text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-7xl"
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
            >
              Break language barriers{" "}
              <span className="text-gradient-hero">everywhere</span>
            </motion.h1>
            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
            >
              Efatha unifies AI and human interpretation under one platform — giving organizations instant, reliable multilingual communication 24/7.
            </motion.p>
            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
            >
              <Link href="/live">
                <Button size="lg" className="bg-accent-gradient text-accent-foreground hover:opacity-90 gap-2 px-8 shadow-glow">
                  <Mic className="h-4 w-4" />
                  Try Efatha Live
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  View Dashboard
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Hero image */}
          <motion.div
            className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-border shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <img src="/branding/hero-bg.jpg" alt="Efatha universal interpretation platform" className="w-full" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Everything you need for seamless interpretation
            </h2>
            <p className="mt-4 text-muted-foreground">
              One platform, two powerful tools. Use AI interpretation, human interpreters, or both — tailored to your organization&apos;s needs.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Plans for every organization
            </h2>
            <p className="mt-4 text-muted-foreground">
              From solo professionals to large enterprise systems — choose the plan that fits your interpretation needs.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-accent bg-card shadow-glow"
                    : "border-border bg-card shadow-soft"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-gradient px-4 py-1 text-xs font-semibold text-accent-foreground">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-8 w-full ${plan.highlighted ? "bg-accent-gradient text-accent-foreground hover:opacity-90" : ""}`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {[
              { q: "How does Efatha Live's AI interpretation work?", a: "Efatha Live uses advanced speech-to-speech AI to provide real-time interpretation. One person speaks in their language, and the other hears the translation instantly. A live bilingual transcript is generated throughout the session." },
              { q: "Can we use both AI and human interpreters?", a: "Absolutely. Our Full Service plan gives you access to both tools. Use AI for instant, on-demand interpretation and schedule human interpreters for complex cases or when a personal touch is needed." },
              { q: "Is Efatha secure and compliant?", a: "Yes. All data is encrypted in transit and at rest. We offer full HIPAA compliance for healthcare settings, and session transcripts are stored securely and accessible only to authorized users within your organization." },
              { q: "What languages are supported?", a: "Efatha Live supports 200+ languages for AI interpretation. Human interpreter availability varies by language pair — contact us for specific language needs." },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="rounded-xl border border-border bg-card p-6 shadow-soft"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <h3 className="font-display font-semibold text-foreground">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl rounded-2xl bg-hero p-12 text-center md:p-16">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Ready to break language barriers?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Join organizations worldwide using Efatha to provide seamless communication across languages.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/live">
                <Button size="lg" className="bg-accent-gradient text-accent-foreground hover:opacity-90 gap-2 px-8">
                  <Mic className="h-4 w-4" />
                  Try Efatha Live
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white">
                <Headphones className="h-4 w-4" />
                Talk to Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient">
              <Languages className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">Efatha</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Efatha. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}