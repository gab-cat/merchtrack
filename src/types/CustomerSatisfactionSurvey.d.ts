type Rating = 1 | 2 | 3 | 4 | 5;

export type CustomerSatisfactionSurvey = {
  id: string
  orderId: string
  submitDate: Date
  question1: Rating
  question2: Rating
  question3: Rating
  question4: Rating
  comments?: string | null
  categoryId: string
}