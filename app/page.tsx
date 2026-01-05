import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, MapPin, Shield, Clock, Smartphone } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">InterpreFi</span>
          </div>
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
              Streamline interpreter bookings for insurance companies with our comprehensive 
              management platform. Connect admins with interpreters seamlessly.
            </p>
          </div>

          {/* Login Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Manage appointments, interpreters, facilities, and patients from a centralized dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/sign-in" className="w-full">
                  <Button className="w-full" size="lg">
                    Admin Login
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Interpreter Portal</CardTitle>
                <CardDescription>
                  Access your interpreter account through our mobile app to view and manage your appointments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/sign-in" className="w-full">
                  <Button variant="outline" className="w-full" size="lg">
                    Interpreter Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
                  <Shield className="h-8 w-8 text-primary mb-4" />
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
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">InterpreFi</span>
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

