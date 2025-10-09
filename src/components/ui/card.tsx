"use client";
import React from "react";

interface CardProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md">
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-b border-gray-700 mb-2">{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-bold">{children}</h2>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);
