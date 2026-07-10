import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center gap-2 min-h-11 min-w-11 px-5 rounded-2xl " +
  "font-bold cursor-pointer transition-[background-color,box-shadow,border-color,opacity] duration-150 " +
  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none " +
  "disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none";

const variants: Record<Variant, string> = {
  primary: "variant-primary bg-primary text-surface shadow-glow-primary hover:brightness-110",
  secondary: "variant-secondary bg-surface text-text border-2 border-line hover:border-primary",
  ghost: "variant-ghost bg-transparent text-text border border-line hover:bg-selection",
};

export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className ?? ""}`} {...rest} />;
}
