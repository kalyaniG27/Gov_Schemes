import React from 'react';
import { Check } from 'lucide-react';

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => onStepClick && index < currentStep && onStepClick(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep
                    ? 'bg-secondary text-white cursor-pointer'
                    : index === currentStep
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                } transition-colors duration-200`}
                disabled={index > currentStep}
              >
                {index < currentStep ? (
                  <Check size={20} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>
              <span
                className={`mt-2 text-xs ${
                  index <= currentStep ? 'text-gray-700 font-medium' : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connector line (except after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index < currentStep ? 'bg-secondary' : 'bg-gray-200'
                } transition-colors duration-200`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;