'use client';

import { useState, useTransition, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import PersonalInfoForm from "./personal-info-form";
import RoleSelectionForm from "./role-selection-form";
import CollegeAndCourseForm from "./college-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Role, College } from "@/types/Misc";
import { clientWrapper } from "@/actions";
import { completeOnboarding } from "@/app/onboarding/_actions";
import { OnboardingForm as OnboardingFormType, OnboardingFormSchema } from "@/schema/user";


export default function OnboardingForm() {
  const { user, isSignedIn } = useUser();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [showRedirect, setShowRedirect] = useState(false);

  const form = useForm({
    mode: "onBlur",
    resolver: zodResolver(OnboardingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      role: Role.STUDENT,
      college: College.NOT_APPLICABLE,
      courses: "",
    },
  });

  const stepTitle: { [key: number]: string } = {
    1: "Personal",
    2: "Role",
    3: "Details",
  };

  useEffect(() => {
    form.setValue("email", user?.emailAddresses[0]?.emailAddress ?? "");
    form.setValue("firstName", user?.firstName ?? "");
    form.setValue("lastName", user?.lastName ?? "");
  }, [isSignedIn, form, user]);

  const handlePageChange = (direction: "next" | "previous") => {
    if (direction === "next") {
      setStep((prev) => Math.min(prev + 1, 3));
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
  };

  async function onSubmit(formData: OnboardingFormType) {
    startTransition(async () => {
      const wrappedFunction = await clientWrapper(
        async () => {
          const response = await completeOnboarding(formData);
          if (response.success) {
            form.reset();
          }
          return response;
        },
        {
          showSuccessToast: true,
          successMessage: "Onboarding completed successfully!",
          successTitle: "Welcome aboard!"
        }
      );
      const result = await wrappedFunction(formData);
      if (result?.success) {
        setShowRedirect(true);
        user?.reload();
        await new Promise(resolve => setTimeout(resolve, 5000));
        redirect('/dashboard');
      }
    });
  }

  return (
    <>
      <Dialog open={showRedirect}>
        <DialogContent className="bg-neutral-2 text-center sm:max-w-[425px]">
          <DialogTitle className="text-primary hidden">Onboarding</DialogTitle>
          <Loader2 className="text-primary mx-auto mb-4 size-8 animate-spin" />
          <h2 className="text-lg font-semibold">Setting up your account...</h2>
          <p className="text-sm text-gray-500">You will be redirected to the dashboard in a few seconds.</p>
        </DialogContent>
      </Dialog>

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
            className="bg-primary h-1 transition-all duration-300 ease-in-out"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="font-inter mb-4 flex w-full flex-col space-y-4 pt-8">
            {step === 1 && <PersonalInfoForm form={form} />}
            {step === 2 && <RoleSelectionForm form={form} />}
            {step === 3 && <CollegeAndCourseForm form={form} />}
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button 
              type="button"
              onClick={() => handlePageChange("previous")} 
              disabled={step === 1} 
              variant="outline" 
              className="w-28"
            >
              <ChevronLeft className="mr-2 size-4" /> Previous
            </Button>
            {step < 3 ? (
              <Button 
                type="button"
                onClick={() => handlePageChange("next")} 
                className="w-28 text-white"
              >
                Next <ChevronRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button 
                type="submit"
                disabled={isPending}
                className="w-28 text-white"
              >
                {isPending ? (
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
        </form>
      </Form>
    </>
  );
}
