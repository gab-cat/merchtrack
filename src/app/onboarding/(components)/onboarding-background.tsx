import React from 'react';

const OnboardingBackground = () => {
  return (
    <div className="absolute inset-0 bg-white opacity-10">
      <svg className="size-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="small-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#small-grid)" />
      </svg>
    </div>
  );
};

export default OnboardingBackground;