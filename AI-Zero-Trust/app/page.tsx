import Link from "next/link"
import { ArrowRight, BarChart2, Car, DollarSign, LineChart } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Car className="h-6 w-6" />
            <span>CarValueAI</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium transition-colors hover:text-primary">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium transition-colors hover:text-primary">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Predict Car Sales Prices with AI Precision
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our advanced machine learning algorithms analyze market trends and vehicle data to provide accurate
                    price predictions for your car.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/sign-up">
                    <Button size="lg" className="gap-1">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 p-4 dark:from-teal-950 dark:to-teal-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LineChart className="h-64 w-64 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Our platform offers powerful tools to help you make informed decisions about car sales.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Accurate Predictions</h3>
                <p className="text-center text-muted-foreground">
                  Our AI model is trained on millions of car sales data points for precise price predictions.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Market Analysis</h3>
                <p className="text-center text-muted-foreground">
                  Get real-time market insights to understand the best time to sell your vehicle.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Vehicle Valuation</h3>
                <p className="text-center text-muted-foreground">
                  Detailed breakdown of factors affecting your car's value with customized recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Our simple process helps you get accurate car value predictions in minutes.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="text-xl font-bold">Create an Account</h3>
                <p className="text-center text-muted-foreground">
                  Sign up and get access to our advanced prediction tools.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="text-xl font-bold">Enter Vehicle Details</h3>
                <p className="text-center text-muted-foreground">
                  Provide information about your car's make, model, year, and condition.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="text-xl font-bold">Get Your Prediction</h3>
                <p className="text-center text-muted-foreground">
                  Receive a detailed analysis and price prediction for your vehicle.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Hear from people who have used our platform to make informed car selling decisions.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col justify-between rounded-lg border p-6">
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    "The prediction was spot on. I sold my car for just $200 less than what the system predicted."
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="ml-4">
                    <p className="text-sm font-medium">Michael Johnson</p>
                    <p className="text-sm text-muted-foreground">Car Owner</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border p-6">
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    "This tool helped me understand the best time to sell my vehicle. Saved me thousands!"
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="ml-4">
                    <p className="text-sm font-medium">Sarah Williams</p>
                    <p className="text-sm text-muted-foreground">Car Dealer</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border p-6">
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    "The market insights were invaluable. I knew exactly what factors were affecting my car's value."
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="ml-4">
                    <p className="text-sm font-medium">David Chen</p>
                    <p className="text-sm text-muted-foreground">Private Seller</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="gap-1">
                  Get Started Today <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-bold">
            <Car className="h-6 w-6" />
            <span>CarValueAI</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} CarValueAI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
