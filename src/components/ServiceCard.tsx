// src/components/ServiceCard.tsx
'use client';

import React, { ReactNode } from 'react';

type ServiceCardProps = {
  title: string;
  description: string;
  icon?: ReactNode; // Optional icon to display on the card
  onClick: () => void;
  className?: string; // Allows for additional styling from parent
  style?: React.CSSProperties; // Allow passing style prop
};

export default function ServiceCard({
  title,
  description,
  icon,
  onClick,
  className,
  style, // Destructure style prop
}: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center
        p-6 border rounded-lg shadow-md
        text-white hover:shadow-lg transition-all duration-200
        w-full max-w-sm text-center
        ${className || ''}
      `}
      style={style} // Apply the passed style prop
    >
      {icon && <div className="mb-3 text-4xl">{icon}</div>}
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-sm opacity-90">{description}</p>
    </button>
  );
}
