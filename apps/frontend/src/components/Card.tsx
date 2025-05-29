import React from 'react';

export interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card = ({ title, children }: CardProps) => {
  return (
    <div className="border rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
};
