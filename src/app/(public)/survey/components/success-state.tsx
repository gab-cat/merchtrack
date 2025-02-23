'use client';

import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/constants/animations";

interface SuccessStateProps {
  title: string;
  message: string;
}

export function SuccessState({ title, message }: Readonly<SuccessStateProps>) {
  return (
    <motion.div {...fadeInUp} className="container mx-auto mt-10 max-w-2xl p-4">
      <Card className="border-success/50">
        <CardContent className="p-6">
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <CheckCircle2 className="size-12 text-emerald-500" />
            </motion.div>
            <h2 className="text-center text-2xl font-bold text-emerald-500">
              {title}
            </h2>
            <p className="text-center text-neutral-6">
              {message}
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}