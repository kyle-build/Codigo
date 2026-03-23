import React from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function AuthInput({ label, error, icon, className, ...props }: AuthInputProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-emerald-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${
            icon ? "pl-10" : ""
          } ${error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 animate-pulse">{error}</p>}
    </div>
  );
}












