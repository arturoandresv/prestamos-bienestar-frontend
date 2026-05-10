interface Step {
  label: string
}

interface StepperProps {
  readonly steps: Step[]
  readonly currentStep: number
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isActive    = index === currentStep
        const isLast      = index === steps.length - 1

        const getCircleClass = () => {
          if (isCompleted) return 'bg-[#0F6E56] text-white'
          if (isActive)    return 'bg-[#1A3A6B] text-white'
          return 'bg-gray-100 text-gray-400'
        }

        const getLabelClass = () => {
          if (isActive)    return 'text-[#1A3A6B] font-medium'
          if (isCompleted) return 'text-[#0F6E56]'
          return 'text-gray-400'
        }

        const circleClass = getCircleClass()
        const labelClass  = getLabelClass()

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            {/* Círculo + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${circleClass}`}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${labelClass}`}>
                {step.label}
              </span>
            </div>

            {/* Línea conectora */}
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
                isCompleted ? 'bg-[#0F6E56]' : 'bg-gray-200'
              }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
