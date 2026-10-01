import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  variant?: "gold" | "ghost" | "white";
};

export function GoldButton({
  children,
  to,
  href,
  onClick,
  type = "button",
  className,
  variant = "gold",
}: Props) {
  const cls = cn(
    "inline-flex",
    variant === "gold" && "gold-btn",
    variant === "ghost" && "ghost-btn",
    variant === "white" && "dark-btn",
    className,
  );

  if (to) {
    return (
      <Link to={to as "/"} className={cls}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
