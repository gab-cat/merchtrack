export type CustomerSatisfactionSurvey = {
  id: string
  orderId: string
  submitDate: Date
  question1: number
  question2: number
  question3: number
  question4: number
  comments?: string | null
  categoryId: string
}