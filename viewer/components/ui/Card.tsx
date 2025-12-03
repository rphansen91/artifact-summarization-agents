import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({ children, className = '', hoverEffect = true, ...props }: CardProps) {
  return (
    <div
      className={`
        glass-card p-6 
        ${hoverEffect ? 'hover:translate-y-[-4px] hover:shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-500/50' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
