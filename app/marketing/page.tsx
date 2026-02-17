/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Smartphone, Bell, CheckCircle, ArrowLeft } from "lucide-react";
import { motion, Variants } from "framer-motion";


// Prevent static prerendering - fixes Next.js 15 build error
export const dynamic = "force-dynamic";

// The strictly typed, foolproof variant
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, 
    y: 0,   
    transition: { 
      delay: i * 0.1, 
      duration: 0.5, 
      ease: "easeOut" // Switching back to a safe string to bypass the array type error
    }
  })
};

export default function InterpreterShowcasePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center justify-start gap-4 flex-1">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="relative h-8 w-[200px] overflow-visible">
              <Image
                src="/branding/Transparent Logo.png"
                alt="InterpreFi"
                fill
                className="object-contain object-left origin-left"
                sizes="200px"
                priority
              />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-6">
            <Link 
              href="/interpreters" 
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Interpreter Portal
            </Link>
            <Link href="/sign-in">
              <Button variant="default" className="bg-accent-gradient text-white hover:opacity-90">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 container mx-auto px-4 py-16 lg:py-24 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4 flex flex-col items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                For Interpreters
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl lg:text-6xl font-extrabold tracking-tight text-foreground"
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
            >
              Your entire schedule,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 mt-2">
                in your pocket.
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
            >
              The InterpreFi mobile platform gives you everything you need to manage appointments, navigate to facilities, and submit close-outs instantly.
            </motion.p>
          </div>

          {/* Download/Portal CTA */}
          <motion.div 
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <Link href="/interpreter" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-accent-gradient text-white hover:opacity-90 shadow-glow" size="lg">
                <Smartphone className="mr-2 h-5 w-5" />
                Open Mobile Portal
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section 1: Text Left + Screenshots Right */}
      <section className="border-t py-16 lg:py-24 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Text Content - Left */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                  Everything at your fingertips
                </h2>
                <p className="text-lg text-muted-foreground">
                  Ditch the messy emails and disjointed calendars. Our platform provides a clean, centralized view of your workday, complete with real-time facility routing.
                </p>
                <ul className="space-y-6 mt-8">
                  <motion.li 
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Calendar className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-foreground">Smart Calendar</span>
                      <p className="text-muted-foreground mt-1">View your upcoming shifts and historical data at a glance.</p>
                    </div>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-foreground">One-Tap Navigation</span>
                      <p className="text-muted-foreground mt-1">Instantly route to clinics and hospitals with integrated maps.</p>
                    </div>
                  </motion.li>
                </ul>
              </motion.div>

              {/* Screenshots - Right */}
              <motion.div 
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border group bg-slate-900 flex items-center justify-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                <div className="relative z-10 p-8 w-full h-full flex items-center justify-center">
                  <img
                    src="/screenshots/combo1-calendar-map.png"
                    alt="InterpreFi calendar and map views"
                    className="max-h-full w-auto object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Flow Banner */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-slate-900 rounded-3xl p-12 text-center relative overflow-hidden shadow-xl border border-slate-800">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.2),transparent_70%)] pointer-events-none" />
              
              <h3 className="text-3xl font-bold text-white mb-4 relative z-10">Streamlined Workflow</h3>
              <p className="text-slate-300 mb-10 max-w-2xl mx-auto relative z-10 text-lg">
                Focus on interpreting, not administrative work. We handle the logistics from request to payout.
              </p>
              
              <div className="flex items-center justify-center gap-4 text-sm font-semibold flex-wrap relative z-10">
                <span className="bg-white/10 text-white px-6 py-3 rounded-full border border-white/5 backdrop-blur-sm">Notification</span>
                <span className="text-teal-400">→</span>
                <span className="bg-white/10 text-white px-6 py-3 rounded-full border border-white/5 backdrop-blur-sm">Accept</span>
                <span className="text-teal-400">→</span>
                <span className="bg-white/10 text-white px-6 py-3 rounded-full border border-white/5 backdrop-blur-sm">Service</span>
                <span className="text-teal-400">→</span>
                <span className="bg-white/10 text-white px-6 py-3 rounded-full border border-white/5 backdrop-blur-sm">Close-Out</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Screenshots Left + Text Right */}
      <section className="border-t py-16 lg:py-24 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Screenshots - Left */}
              <motion.div 
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border group bg-slate-900 flex items-center justify-center order-2 lg:order-1"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.15),transparent_50%)]" />
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.15),transparent_50%)]" />
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                <div className="relative z-10 p-8 w-full h-full flex items-center justify-center">
                  <img
                    src="/screenshots/combo2-notification-close.png"
                    alt="InterpreFi push notifications and close out screen"
                    className="max-h-full w-auto object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </motion.div>

              {/* Text Content - Right */}
              <motion.div 
                className="space-y-6 order-1 lg:order-2"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                  Instant Updates & Close-outs
                </h2>
                <p className="text-lg text-muted-foreground">
                  Get notified the second a new appointment matching your languages is available. When the job is done, closing out is a frictionless process.
                </p>
                <ul className="space-y-6 mt-8">
                  <motion.li 
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Bell className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-foreground">Push Notifications</span>
                      <p className="text-muted-foreground mt-1">Never miss out on an assignment opportunity in your area.</p>
                    </div>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <CheckCircle className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-foreground">Frictionless Close-Out</span>
                      <p className="text-muted-foreground mt-1">Log your exact end time and add provider notes immediately after the encounter.</p>
                    </div>
                  </motion.li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative h-8 w-48">
              <Image
                src="/branding/Transparent Logo.png"
                alt="InterpreFi"
                fill
                className="object-contain object-left"
                sizes="192px"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} InterpreFi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}