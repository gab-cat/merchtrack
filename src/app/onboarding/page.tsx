"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PersonalInfoForm from "./(components)/personal-info-form";
import RoleSelectionForm from "./(components)/role-selection-form";
import CollegeAndCourseForm from "./(components)/college-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OnboardingBackground from "@/app/onboarding/(components)/onboarding-background";
import { OnboardingFormSchema } from "@/schema/user";
import { clientWrapper } from "@/actions";
import { ValidationError } from "@/types/errors";
import { completeOnboarding } from "@/app/onboarding/_actions";
import PageAnimation from "@/components/public/page-animation";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isSignedIn } =  useUser();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    role: "STUDENT",
    college: "NOT_APPLICABLE",
    courses: "",
    email: "",
  });


  const stepTitle: { [key: number]: string } = {
    1: "Personal",
    2: "Role",
    3: "Details",
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.primaryEmailAddress?.emailAddress ?? "",
    }));
  }, [isSignedIn]);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await clientWrapper(async () => {
        const { success, data } = OnboardingFormSchema.safeParse(formData);
        if (!success) {
          throw new ValidationError("Invalid form data");
        }
        await completeOnboarding(data);
        return router.push("/admin");
      }, {
        showSuccessToast: true,
        successMessage: "Onboarding completed successfully"
      })();
    } finally {
      setIsSubmitting(false);
    }
  };

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
                layout="fill"
                objectFit="contain"
                className="w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-medium">Welcome to <span className="font-bold tracking-tighter text-primary">MerchTrack!</span></CardTitle>
            <CardDescription>Let&apos;s get you set up in just a few steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full ${step >= i ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}
                    >
                      {i}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {stepTitle[i]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 h-1 w-full bg-gray-200">
                <div
                  className="h-1 bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                ></div>
              </div>
            </div>

            {step === 1 && <PersonalInfoForm formData={formData} updateFormData={updateFormData} />}
            {step === 2 && <RoleSelectionForm formData={formData} updateFormData={updateFormData} />}
            {step === 3 && <CollegeAndCourseForm formData={formData} updateFormData={updateFormData} />}

            <div className="mt-6 flex justify-between">
              <Button onClick={handlePrevious} disabled={step === 1} variant="outline" className="w-28">
                <ChevronLeft className="mr-2 size-4" /> Previous
              </Button>
              {step < 3 ? (
                <Button onClick={handleNext} className="w-28 text-white">
                Next <ChevronRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button 
                  onClick={() => handleSubmit()} 
                  disabled={isSubmitting}
                  className="w-28 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Complete'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </PageAnimation>
    </div>
  );
}

