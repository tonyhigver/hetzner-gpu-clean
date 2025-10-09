"use client";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "solid" | "outline"; // ⚡ Agregamos la prop variant
}

export const Button: React.FC<ButtonProps> = ({ children, variant = "solid", className = "", ...props }) => {
  // Base de clases comunes
  const baseClasses = "px-4 py-2 rounded-lg font-semibold transition-all";

  // Clases según variant
  const variantClasses =
    variant === "outline"
      ? "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button {...props} className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </button>
  );
};
