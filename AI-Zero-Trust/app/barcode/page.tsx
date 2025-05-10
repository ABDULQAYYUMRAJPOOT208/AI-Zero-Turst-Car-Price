"use client"

import { Suspense } from "react"
import { Car } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import QRCode from "qrcode"
import { Check, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import axios from "axios"
// Main page component that only handles the Suspense boundary
export default function QRCodeScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Suspense fallback={
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center">
              <Car className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="h-[200px] w-[200px] animate-pulse rounded-md bg-muted" />
            </div>
          </CardContent>
        </Card>
      }>
        <BarcodeContent />
      </Suspense>
    </div>
  )
}

// Nested component that uses useSearchParams and contains all the logic
function BarcodeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mfaSecret = searchParams.get("mfaSecret")
  
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  
  useEffect(() => {
    setEmail(searchParams.get("email"));
    if (email && mfaSecret) {
      const generateQRCode = async () => {
        try {
          const otpAuthUrl = `otpauth://totp/AIZeroTrustProject:${email}?secret=${mfaSecret}&issuer=AIZeroTrustProject`
          const qrDataUrl = await QRCode.toDataURL(otpAuthUrl);
          setQrCodeDataUrl(qrDataUrl);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to generate QR Code:", error)
        } finally {
          setIsLoading(false)
        }
      }

      generateQRCode()
    }
  }, [email, mfaSecret, searchParams])

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return

    const link = document.createElement("a")
    link.href = qrCodeDataUrl
    link.download = "AIZeroTrustProject-QRCode.png"
    link.click()
  }

  // const continueToApp = () => {
  //   router.push("/dashboard")
  // }

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/verify-mfa", {
        email,
        token,
      });

      if (res.data.success) {
        alert("MFA setup complete!");
        router.push("/sign-in");
      } else {
        setError("Invalid token. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Verification failed.");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center">
          <Car className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-center text-2xl">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-center">
          Scan this QR Code using your authenticator app
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {isLoading ? (
            <div className="h-[200px] w-[200px] animate-pulse rounded-md bg-muted" />
          ) : (
            qrCodeDataUrl && (
              <div className="overflow-hidden rounded-md border bg-white p-2">
                <img src={qrCodeDataUrl} alt="QR Code" className="h-[200px] w-[200px]" />
              </div>
            )
          )}
        </div>
        <div className="rounded-md bg-muted p-4">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <p className="text-sm font-medium">QR Code successfully generated</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Use it to enable multi-factor authentication (MFA) in your authenticator app (e.g., Google Authenticator, Authy).
          </p>
        </div>
        <div className="space-y-2">
            <Label htmlFor="name">Enter You MFA token key</Label>
            <Input
              id="name"
              name="name"
              placeholder="XXX XXX"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading}
            />
          </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3">
        <Button
          onClick={downloadQRCode}
          variant="outline"
          className="w-full gap-2"
          disabled={isLoading}
        >
          <Download className="h-4 w-4" />
          Download QR Code
        </Button>
        <Button
          onClick={handleVerifyToken}
          className="w-full"
          disabled={isLoading}
        >
          Continue to Dashboard
        </Button>
      </CardFooter>
    </Card>
  )
}
