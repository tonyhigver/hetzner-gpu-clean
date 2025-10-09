"use client";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string; // ✅ permite pasar clases desde fuera
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`p-6 bg-gray-800 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
};

interface CardChildProps {
  children: React.ReactNode;
  className?: string; // ✅ permite pasar clases desde fuera
}

export const CardHeader: React.FC<CardChildProps> = ({ children, className = "" }) => (
  <div className={`border-b border-gray-700 mb-2 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<CardChildProps> = ({ children, className = "" }) => (
  <h2 className={`text-lg font-bold ${className}`}>{children}</h2>
);

export const CardContent: React.FC<CardChildProps> = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);
