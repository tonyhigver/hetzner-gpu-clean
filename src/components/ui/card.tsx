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
