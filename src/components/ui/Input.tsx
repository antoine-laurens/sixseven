"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm text-[var(--text-secondary)] font-medium"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3
            bg-[var(--bg-surface)] 
            border border-[var(--border-subtle)]
            rounded-xl
            text-[var(--text-primary)] text-sm
            placeholder:text-[var(--text-muted)]
            outline-none
            transition-all duration-200
            focus:border-[var(--accent-purple)] focus:shadow-[var(--glow-purple)]
            hover:border-[var(--border-medium)]
            ${error ? "border-[var(--accent-red)]! shadow-[var(--glow-red)]!" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs text-[var(--accent-red)]">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
