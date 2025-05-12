'use client';

import { useState, useEffect } from "react";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2, User, BookOpen, Building2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { default as NextLink } from "next/link";
import {PersonalInfoForm, RoleSelectionForm, CollegeAndCourseForm} from ".";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Role } from "@/types/Misc";
import { completeOnboarding } from "@/features/customer/onboarding/actions/completeOnboarding";
import { OnboardingForm as OnboardingFormType, OnboardingFormSchema } from "@/features/customer/onboarding/users.schema";
import useToast from "@/hooks/use-toast";

// Step configuration with icons and validation fields
const STEPS_CONFIG = [
  {
    id: 1,
    title: "Personal",
    icon: <User className="size-5" />,
    fields: ["firstName", "lastName", "phone", "email"],
    component: PersonalInfoForm,
  },
  {
    id: 2,
    title: "Role",
    icon: <BookOpen className="size-5" />,
    fields: ["role"],
    component: RoleSelectionForm,
  },
  {
    id: 3,
    title: "Details",
    icon: <Building2 className="size-5" />,
    fields: ["college", "courses"],
    component: CollegeAndCourseForm,
  },
];

export default function OnboardingForm() {
  const { user, isSignedIn } = useUser();
  const [step, setStep] = useState(1);
  const [showRedirect, setShowRedirect] = useState(false);

  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(OnboardingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      role: Role.STUDENT,
      college: undefined, // Remove default selection so user must actively choose
      courses: "",
    },
  });

  const { mutate, isPending, failureReason } = useMutation({
    mutationFn: (formData: OnboardingFormType) => completeOnboarding(formData),
    onSuccess: (data) => {
      if (!data.success) {
        return useToast({
          type: 'error',
          message: data.message ?? 'Failed to complete onboarding',
          title: 'Error in Completing Onboarding'
        });
      }

      useToast({
        type: 'success',
        message: 'Welcome aboard!',
        title: 'Onboarding completed successfully.',
        duration: 10
      });
      setShowRedirect(true);
      user?.reload();
      setTimeout(() => redirect('/dashboard'), 5000);
    },
    onError: () => {
      useToast({
        type: 'error',
        message: 'An error occurred while completing your request. Please try again later.',
        title: failureReason?.message ?? 'Error in Completing Onboarding'
      });
    }
  });

  async function onSubmit(formData: OnboardingFormType) {
    mutate(formData);
  }

  useEffect(() => {
    form.setValue("email", user?.emailAddresses[0]?.emailAddress ?? "");
    form.setValue("firstName", user?.firstName ?? "");
    form.setValue("lastName", user?.lastName ?? "");
  }, [isSignedIn, form, user]);

  // Validate current step fields
  const validateStep = async () => {
    const currentStepConfig = STEPS_CONFIG.find(s => s.id === step);
    if (!currentStepConfig) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await form.trigger(currentStepConfig.fields as any);
    return result;
  };

  const handleNextStep = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // Check if current step is valid
  const currentStepConfig = STEPS_CONFIG.find(s => s.id === step) || STEPS_CONFIG[0];
  const isCurrentStepValid = currentStepConfig.fields.every(
    field => !form.formState.errors[field as keyof OnboardingFormType]
  );

  const CurrentStepComponent = currentStepConfig.component;

  return (
    <>
      <Dialog open={showRedirect}>
        <DialogContent className="bg-neutral-2 text-center sm:max-w-[425px]">
          <DialogTitle className="text-xl text-primary">Onboarding Complete</DialogTitle>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative mb-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex size-16 items-center justify-center rounded-full bg-green-100"
              >
                <CheckCircle className="size-10 text-green-600" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                transition={{ delay: 0.3, duration: 1, repeat: Infinity, repeatType: "reverse" }}
                className="absolute left-1/2 top-1/2 z-0 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-50 opacity-60"
              />
            </div>
            <h2 className="text-lg font-semibold">Setting up your account...</h2>
            <p className="text-sm text-gray-500">You will be redirected to the dashboard in a few seconds. If not, click the button below.</p>
            <NextLink
              href="/dashboard"
              className="mt-4 rounded-lg border border-primary bg-white/50 px-4 py-2 font-bold text-primary transition-colors hover:bg-primary-100"
            >
              Go to Dashboard
            </NextLink>
            <p className="mt-2 text-xs text-gray-500">If you encounter any issues, try to refresh the page. If problem persists, please contact support.</p>
            <p className="text-xs text-gray-500">Thank you for your patience!</p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-6">
        <div className="mb-6 flex items-center justify-between">
          {STEPS_CONFIG.map((stepConfig) => (
            <div key={stepConfig.id} className="flex flex-col items-center">
              <motion.div
                className={`flex size-10 items-center justify-center rounded-full transition-colors duration-300 ${
                  step >= stepConfig.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: stepConfig.id * 0.1 }}
              >
                {stepConfig.icon}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stepConfig.id * 0.15 }}
                className="mt-2 text-xs font-medium text-gray-600"
              >
                {stepConfig.title}
              </motion.div>
            </div>
          ))}
        </div>
        <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((step - 1) / 2) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[260px]"
            >
              <div className="mb-2 text-center">
                <h2 className="text-lg font-semibold text-primary">
                  {currentStepConfig.title} Information
                </h2>
                <p className="text-sm text-gray-500">
                  Step {step} of {STEPS_CONFIG.length}
                </p>
              </div>
              <div className="flex w-full flex-col space-y-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <CurrentStepComponent form={form} />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              onClick={handlePreviousStep}
              disabled={step === 1}
              variant="outline"
              className="w-28 gap-1 transition-all duration-200 hover:bg-gray-50"
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={!isCurrentStepValid}
                className="w-28 gap-1 bg-primary text-white transition-all duration-200 hover:bg-primary/90 disabled:opacity-50"
              >
                Next <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending || !isCurrentStepValid}
                className="w-32 gap-2 bg-primary text-white transition-all duration-200 hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4" />
                    Complete
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </>
  );
}
