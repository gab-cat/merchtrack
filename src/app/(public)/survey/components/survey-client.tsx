'use client';

import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole } from "lucide-react";
import { container, item } from "./animation-variants";
import { OrderDetails } from "./order-details";
import { SurveyForm } from "./survey-form";
import { ErrorState } from "./error-state";
import { SuccessState } from "./success-state";
import { submitSurveySchema, type SubmitSurveyType } from "@/schema/survey.schema";
import { submitSurveyResponse } from "@/actions/survey.actions";
import { useSurveyQuery } from "@/hooks/survey.hooks";
import useToast from "@/hooks/use-toast";

interface SurveyClientProps {
  surveyId?: string;
}

export function SurveyClient({ surveyId }: Readonly<SurveyClientProps>) {
  const [submitted, setSubmitted] = useState(false);
  const { data: survey, isPending: isLoading } = useSurveyQuery(surveyId!);

  const form = useForm<SubmitSurveyType>({
    resolver: zodResolver(submitSurveySchema),
    defaultValues: {
      surveyId: surveyId ?? "",
      answers: {},
      comments: ""
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: SubmitSurveyType) => {
      return submitSurveyResponse(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        setSubmitted(true);
        useToast({
          type: "success",
          title: "Success",
          message: "Thank you for your feedback!"
        });
      } else {
        useToast({
          type: "error",
          title: "Error",
          message: response.message ?? "Failed to submit survey"
        });
      }
    }
  });

  if (!surveyId) {
    return (
      <ErrorState
        icon={<LockKeyhole className="text-destructive size-12" />}
        title=""
        message="Invalid survey link"
        variant="default"
      />
    );
  }

  if (isLoading) {
    return (
      <ErrorState
        icon={<FaSpinner className="size-12 animate-spin text-primary"/>}
        title="Loading Survey"
        message="Please wait for a moment as we fetch your survey."
        variant="default"
      />
    );
  }

  if (!survey) {
    return (
      <ErrorState
        icon={<LockKeyhole className="size-12 text-accent-destructive" />}
        title="Survey not found"
        message="The requested survey could not be found."
        variant="error"
      />
    );
  }

  if (survey.metadata !== null) {
    return (
      <ErrorState
        icon={<LockKeyhole className="size-12 text-accent-warning" />}
        title="Survey Already Submitted"
        message="This survey has already been completed. Thank you for your participation!"
        variant="warning"
      />
    );
  }

  if (submitted) {
    return (
      <SuccessState
        title="Thank You!"
        message="Your feedback has been submitted successfully. We appreciate your time and input."
      />
    );
  }

  return (
    <div className="container mx-auto mt-10 p-4">
      <div className="grid gap-6 lg:grid-cols-2">
        <OrderDetails order={survey.order} />
        <SurveyForm 
          orderId={survey.orderId}
          order={survey.order}
          form={form}
          onSubmit={(data) => mutate(data)}
          isPending={isPending}
          variants={container}
          item={item}
          category={survey.category}
        />
      </div>
    </div>
  );
}