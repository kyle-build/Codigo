import React from "react";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  isLoading?: boolean;
}

export function AuthButton({
  children,
  className,
  variant = "primary",
  isLoading,
  ...props
}: AuthButtonProps) {
  const baseStyles =
    "relative w-full rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#07090f] disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-400 hover:shadow-emerald-500/40 hover:-translate-y-0.5 focus:ring-emerald-500",
    outline:
      "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/30 hover:text-white focus:ring-white/20",
    ghost: "bg-transparent text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
          <span>Wait...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}












