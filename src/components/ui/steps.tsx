import { cn } from "@/lib/utils";

type Step = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status: "upcoming" | "current" | "completed";
  completed?: boolean;
};

type StepsProps = {
  steps: readonly Step[];
  currentStep: number;
  className?: string;
};

export function Steps({ steps, currentStep, className }: Readonly<StepsProps>) {
  const getStepStyle = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) return "border-primary bg-primary text-neutral-2";
    if (isCurrent) return "border-primary bg-white text-primary";
    return "border-muted bg-white text-muted-foreground";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.completed || index < currentStep - 1;
          const isCurrent = index === currentStep - 1;
          const stepStyle = getStepStyle(isCompleted, isCurrent);

          return (
            <div
              key={step.title}
              className="relative flex flex-1 flex-col items-center"
            >
              {index !== 0 && (
                <div
                  className={cn(
                    "absolute left-0 top-[15px] h-0.5 w-full -translate-x-1/2",
                    isCompleted ? "bg-primary" : "bg-neutral-3"
                  )}
                />
              )}
              
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                    stepStyle
                  )}
                >
                  {step.icon || index + 1}
                </div>
                <div className="mt-2 text-center">
                  <div className={cn(
                    "text-sm font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-muted-foreground text-xs">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}