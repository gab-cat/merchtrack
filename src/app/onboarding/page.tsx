import { redirect } from "next/navigation";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

import { auth } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingBackground, OnboardingForm } from "@/features/customer/onboarding/components";

export default async function OnboardingPage() {
  const { userId, sessionClaims } = await auth();

  // Redirect if user is already onboarded
  if (sessionClaims?.metadata.isOnboardingCompleted) {
    redirect("/dashboard");
  }

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="relative min-h-screen">
      {/* Interactive Particle Background */}
      <OnboardingBackground 
        density={70}
        connectionDistance={150}
        particleSize={1.5}
        speed={0.3}
        interactive={true}
      />
      
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-md">
          {/* Logo Header */}
          <div className="mb-6 flex flex-col items-center justify-center rounded-md border bg-white/80 py-4 text-center shadow-sm backdrop-blur-sm">
            <div className="relative mb-2 size-16">
              <Image
                src="/img/logo.png"
                alt="MerchTrack Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-primary">Welcome to MerchTrack</h1>
            <p className="text-sm text-gray-600">Please complete your profile to continue</p>
          </div>

          {/* Card with Form */}
          <Card className="rounded-xl border-none bg-white/90 p-6 backdrop-blur-sm">
            <CardContent className="p-0 pb-4 pt-2">
              <OnboardingForm />
              
              {/* Security notice */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="size-4 text-primary" />
                <span>Your data is secure and private</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}