import React from 'react';

type LoaderProps = {
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export const Loader: React.FC<LoaderProps> = ({ label, className = '', size = 'lg' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`relative ${sizeMap[size]}`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
        {/* Animated arc */}
        <div className="absolute inset-0 rounded-full border-4 border-t-yellow-500 border-r-orange-500 border-b-transparent border-l-transparent animate-spin"></div>
        {/* Center dot */}
        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-black"></div>
      </div>
      {label && (
        <div className="text-sm font-medium text-muted-foreground">
          {label}
        </div>
      )}
    </div>
  );
};

export default Loader;


