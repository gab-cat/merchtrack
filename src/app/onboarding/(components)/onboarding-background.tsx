import React, { useCallback } from 'react';

interface OnboardingBackgroundProps {
  gridSize?: number;
  opacity?: number;
  color?: string;
}

const OnboardingBackground = React.memo(({
  gridSize = 20,
  opacity = 0.1,
  color = 'currentColor'
}: OnboardingBackgroundProps) => {
  const renderPath = useCallback(() => (
    <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke={color} strokeWidth="0.5" />
  ), [gridSize, color]);

  return (
    <div className="absolute inset-0 bg-white" style={{ opacity }}>
      <svg 
        className="size-full" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Background grid pattern"
      >
        <defs>
          <pattern id="small-grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            {renderPath()}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#small-grid)" />
      </svg>
    </div>
  );
});

OnboardingBackground.displayName = 'OnboardingBackground';
export default OnboardingBackground;