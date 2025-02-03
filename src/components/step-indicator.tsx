import { Check } from "lucide-react";

export interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <div key={step} className="flex items-center">
            <div
              className={`step ${isActive ? "active" : ""} ${
                isCompleted ? "completed" : ""
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{stepNumber}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`step-line ${
                  currentStep > stepNumber ? "completed" : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
} 