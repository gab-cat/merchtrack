import { z } from "zod";

export const surveyQuestionSchema = z.object({
  questionId: z.string(),
  score: z.number().min(1).max(5)
});

export const createSurveyCategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  question1: z.string().max(200, "Question must not exceed 200 characters"),
  question2: z.string().max(200, "Question must not exceed 200 characters"),
  question3: z.string().max(200, "Question must not exceed 200 characters"),
  question4: z.string().max(200, "Question must not exceed 200 characters"),
});

export const updateSurveyCategorySchema = createSurveyCategorySchema.partial();

export const submitSurveySchema = z.object({
  surveyId: z.string(),
  answers: z.record(z.string(), z.number().min(1).max(5)),
  comments: z.string().max(500, "Comments must not exceed 500 characters").optional()
});

export type CreateSurveyCategoryType = z.infer<typeof createSurveyCategorySchema>;
export type UpdateSurveyCategoryType = z.infer<typeof updateSurveyCategorySchema>;
export type SubmitSurveyType = z.infer<typeof submitSurveySchema>;