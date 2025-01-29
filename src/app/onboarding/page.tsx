import Image from "next/image";
import { redirect } from "next/navigation";
import OnboardingForm from "./(components)/onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OnboardingBackground from "@/app/onboarding/(components)/onboarding-background";
import PageAnimation from "@/components/public/page-animation";
import { getSessionData, isOnboardingCompleted } from "@/lib/auth";

export default async function OnboardingPage() {
  const { metadata } = await getSessionData();
  if (isOnboardingCompleted(metadata)) {
    return redirect('/dashboard');
  }
  return (
    <div className="to-secondary-500 relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400 via-primary-500 px-4 py-12 sm:px-6 lg:px-8">
      <OnboardingBackground />
      <PageAnimation className="min-w-[100vw]">
        <Card className="mx-auto w-full max-w-lg bg-neutral-2 text-neutral-7 shadow-xl backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="relative mx-auto size-16 pb-4">
              <Image
                src="/img/logo.png"
                alt="MerchTrack Logo"
                width={64}
                height={64}
                priority
                className="w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-medium">Welcome to <span className="font-bold tracking-tighter text-primary">MerchTrack!</span></CardTitle>
            <CardDescription>Let&apos;s get you set up in just a few steps</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm />
          </CardContent>
        </Card>
      </PageAnimation>
    </div>
  );
}