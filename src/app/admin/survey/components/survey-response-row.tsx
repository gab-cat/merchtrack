import { memo } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Button as UIButton } from "@/components/ui/button";
import {
  TableCell,
} from "@/components/ui/table";
import { ExtendedCustomerSurvey } from "@/types/survey";
import { fadeInUp } from "@/constants/animations";

type SurveyRowProps = {
  survey: ExtendedCustomerSurvey;
}

const renderStars = (score: number) => {
  return Array.from({ length: 5 }).map((_, i) => (
    <Star
      key={i}
      className={`size-4 ${i < score ? "fill-primary text-primary" : "fill-none text-gray-300"}`}
    />
  ));
};

export const SurveyResponseRow = memo(({ survey }: SurveyRowProps) => {
  return (
    <motion.tr {...fadeInUp}>
      <TableCell>
        <Link href={`/admin/orders/${survey.orderId}`}>
          <UIButton variant="outline" className="text-primary">
            {survey.orderId}
          </UIButton>
        </Link>
      </TableCell>
      <TableCell>
        {survey.order.customer.firstName} {survey.order.customer.lastName}
      </TableCell>
      <TableCell>{survey.category.name}</TableCell>
      <TableCell>
        <div className="space-y-2">
          {Object.entries(survey.answers as Record<string, number>).map(([key, score]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-sm font-medium">Q{key.slice(1)}:</span>
              <div className="flex items-center">{renderStars(score)}</div>
            </div>
          ))}
        </div>
      </TableCell>
      <TableCell>{survey.comments ?? "No comments"}</TableCell>
      <TableCell>{format(new Date(survey.submitDate), "PPp")}</TableCell>
    </motion.tr>
  );
});

SurveyResponseRow.displayName = "SurveyResponseRow";