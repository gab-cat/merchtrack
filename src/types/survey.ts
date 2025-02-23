import { CustomerSatisfactionSurvey, SurveyCategory } from "@prisma/client";
import { ExtendedOrder } from "@/types/orders";

export type ExtendedCustomerSurvey = CustomerSatisfactionSurvey & {
    category: SurveyCategory
    order: ExtendedOrder
}
