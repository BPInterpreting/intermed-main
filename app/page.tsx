"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, MapPin, Clock, Smartphone, AppWindow, Bell, CheckCircle } from "lucide-react";

// Prevent static prerendering - fixes Next.js 15 build error
export const dynamic = "force-dynamic";

export default function LandingPage() {
  const [image1Loaded, setImage1Loaded] = useState(false);
  const [image2Loaded, setImage2Loaded] = useState(false);
  const [image1Error, setImage1Error] = useState(false);
  const [image2Error, setImage2Error] = useState(false);
  
  // Classical painting backgrounds
  const painting1 = "https://upload.wikimedia.org/wikipedia/commons/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg";
  const painting2 = "https://upload.wikimedia.org/wikipedia/commons/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-barlow font-black">InterpreFi</span>
          </div>
          {/* TODO: Remove sign-in button in production - kept for testing purposes only */}
          <Link href="/sign-in">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Interpreter Management
              <span className="block text-primary mt-2">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Intelligent booking system to connect interpreting services with healthcare providers. 
            </p>
          </div>

          {/* Interpreter Portal Card */}
          <div className="mt-12 max-w-md mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Interpreter Portal</CardTitle>
                <CardDescription>
                  Interpreters can sign in or create an account to access the mobile app and manage appointments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/interpreter" className="w-full">
                  <Button variant="outline" className="w-full" size="lg">
                    Open Interpreter Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 1: Text Left + Screenshots Right */}
      <section className="border-t py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content - Left */}
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                  Empower Your Interpreters
                </h2>
                <p className="text-lg text-muted-foreground">
                  Our mobile app gives interpreters everything they need at their fingertips — calendar views, appointment details, and real-time navigation to facilities.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Calendar Overview</span>
                      <p className="text-sm text-muted-foreground">View all upcoming appointments at a glance</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Built-in Navigation</span>
                      <p className="text-sm text-muted-foreground">Get directions to any facility with one tap</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Complete Details</span>
                      <p className="text-sm text-muted-foreground">Patient info, facility contacts, and appointment notes</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Screenshots - Right */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10 group">
                {/* Loading placeholder */}
                {!image1Loaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 animate-pulse" />
                )}
                
                {/* Painting Background */}
                <img
                  src={painting1}
                  alt=""
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${
                    image1Loaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImage1Loaded(true)}
                  onError={(e) => {
                    console.error('Failed to load painting background 1:', e);
                    setImage1Loaded(true); // Stop loading state even on error
                  }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-black/20" />
                
                {/* Screenshots */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <img
                    src="/screenshots/combo1-calendar-map.png"
                    alt="Mobile app showing calendar and map views"
                    className="max-h-full w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                    onError={(e) => {
                      console.error('Failed to load screenshot 1:', e);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flow Banner - Option 4A */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-10 text-white text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">You request. We deliver.</h3>
              <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                Send us an appointment request and we handle everything — matching, scheduling, confirmation, and follow-up.
              </p>
              <div className="flex items-center justify-center gap-3 text-sm font-medium flex-wrap">
                <span className="bg-white/10 px-4 py-2 rounded-full">Request</span>
                <span className="text-slate-500">→</span>
                <span className="bg-white/10 px-4 py-2 rounded-full">Match</span>
                <span className="text-slate-500">→</span>
                <span className="bg-white/10 px-4 py-2 rounded-full">Confirm</span>
                <span className="text-slate-500">→</span>
                <span className="bg-white/10 px-4 py-2 rounded-full">Complete</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Screenshots Left + Text Right */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Screenshots - Left */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10 group order-2 lg:order-1">
                {/* Loading placeholder */}
                {!image2Loaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 animate-pulse" />
                )}
                
                {/* Painting Background */}
                <img
                  src={painting2}
                  alt=""
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${
                    image2Loaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImage2Loaded(true)}
                  onError={(e) => {
                    console.error('Failed to load painting background 2:', e);
                    setImage2Loaded(true); // Stop loading state even on error
                  }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-black/20" />
                
                {/* Screenshots */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <img
                    src="/screenshots/combo2-notification-close.png"
                    alt="Mobile app showing notifications and appointment closing"
                    className="max-h-full w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                    onError={(e) => {
                      console.error('Failed to load screenshot 2:', e);
                    }}
                  />
                </div>
              </div>

              {/* Text Content - Right */}
              <div className="space-y-6 order-1 lg:order-2">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                  Real-Time Updates
                </h2>
                <p className="text-lg text-muted-foreground">
                  Interpreters receive instant notifications for new appointments and can accept or decline with a single tap. When the job is done, closing out is just as easy.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Push Notifications</span>
                      <p className="text-sm text-muted-foreground">Never miss a new appointment opportunity</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">One-Tap Accept</span>
                      <p className="text-sm text-muted-foreground">Review details and confirm in seconds</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Easy Close-Out</span>
                      <p className="text-sm text-muted-foreground">Log end time and notes when the appointment wraps</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Powerful Features for Seamless Operations
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>Appointment Management</CardTitle>
                  <CardDescription>
                    Schedule, track, and manage interpreter appointments with ease.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage interpreters, patients, and facilities from one central location.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <MapPin className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>Location Services</CardTitle>
                  <CardDescription>
                    Track locations and optimize interpreter assignments by geographic proximity.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>Real-time Updates</CardTitle>
                  <CardDescription>
                    Stay informed with instant notifications and real-time appointment updates.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>Secure & Reliable</CardTitle>
                  <CardDescription>
                    Enterprise-grade security to protect sensitive healthcare information.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Smartphone className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>Mobile Ready</CardTitle>
                  <CardDescription>
                    Full mobile app support for interpreters to access appointments on the go.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-barlow font-black">InterpreFi</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} InterpreFi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}