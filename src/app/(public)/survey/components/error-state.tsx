'use client';

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/constants/animations";

interface ErrorStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  variant?: "warning" | "error" | "default";
}

export function ErrorState({ icon, title, message, variant = "default" }: Readonly<ErrorStateProps>) {
  const variantStyles = {
    warning: "border-accent-warning/50",
    error: "border-accent-destructive/50",
    default: "border-gray-200"
  };

  return (
    <motion.div {...fadeInUp} className="container mx-auto mt-10 max-w-2xl p-4">
      <Card className={variantStyles[variant]}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            {icon}
            {title && (
              <h2 className={`text-center text-xl font-bold ${
                variant !== "default" ? `text-accent-${variant}` : ""
              }`}>
                {title}
              </h2>
            )}
            <p className="text-muted-foreground text-center">
              {message}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}