'use client';

import { Sparkles, Star } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { SurveyCategory } from "@prisma/client";
import type { MotionVariants } from "./animation-variants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { SubmitSurveyType } from "@/features/admin/surveys/survey.schema";
import { ExtendedOrder } from "@/types/orders";

interface SurveyFormProps {
  orderId: string;
  order: ExtendedOrder;
  form: UseFormReturn<SubmitSurveyType>;
  onSubmit: (data: SubmitSurveyType) => void;
  isPending?: boolean;
  variants: MotionVariants;
  item: MotionVariants;
  category: SurveyCategory;
}

export function SurveyForm({ category, form, onSubmit, isPending = false, variants, item }: Readonly<SurveyFormProps>) {
  const handleStarClick = (questionId: string, score: number) => {
    form.setValue(`answers.${questionId}`, score, { shouldValidate: true });
  };

  const questions = [
    { id: 'q1', question: category.question1 },
    { id: 'q2', question: category.question2 },
    { id: 'q3', question: category.question3 },
    { id: 'q4', question: category.question4 },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={variants}
      className="order-1 lg:order-2"
    >
      <Card className="border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle className="text-2xl font-bold text-primary">
              How was your experience?
            </CardTitle>
            <Sparkles className="size-5 text-primary" />
          </div>
          <CardDescription className="mt-2 text-base">
            {category.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {questions.map((question) => (
                <motion.div 
                  key={question.id} 
                  variants={item}
                  className="hover:bg-muted/10 rounded-lg border p-6 transition-colors"
                >
                  <p className="text-base font-medium">{question.question}</p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <motion.div
                        key={score}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="lg"
                          className={cn(
                            "relative size-10 text-yellow-500 rounded-full transition-all",
                            form.watch(`answers.${question.id}`) === score && 
                            "bg-yellow-500 text-neutral-2"
                          )}
                          onClick={() => handleStarClick(question.id, score)}
                        >
                          <Star 
                            className={cn(
                              "size-5 transition-colors",
                              form.watch(`answers.${question.id}`) >= score 
                                ? "fill-current" 
                                : "fill-none stroke-current"
                            )} 
                          />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  {form.formState.errors.answers?.[question.id] && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>
                        Please provide a rating for this question
                      </AlertDescription>
                    </Alert>
                  )}
                </motion.div>
              ))}

              <motion.div 
                variants={item} 
                className="rounded-lg border p-6"
              >
                <label htmlFor="comments" className="text-base font-medium">
                  Additional Comments (Optional)
                </label>
                <Textarea
                  placeholder="Share your thoughts with us..."
                  className="mt-2 min-h-[100px] resize-none"
                  {...form.register("comments")}
                />
              </motion.div>

              <motion.div variants={item}>
                <Button 
                  type="submit" 
                  className="h-12 w-full text-base font-medium transition-opacity disabled:opacity-50"
                  disabled={isPending}
                >
                  {isPending ? "Submitting..." : "Submit Feedback"}
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}