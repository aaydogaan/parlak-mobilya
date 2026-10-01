import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface LogoProps {
  light?: boolean;
  className?: string;
  variant?: "header" | "footer";
}

export function Logo({ light = false, className, variant = "header" }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn("inline-flex items-center group", className)}
      aria-label="Parlak Mobilya ve Dekorasyon Ana Sayfa"
    >
      <img
        src="/images/logo-header.png"
        alt="Parlak Mobilya ve Dekorasyon"
        width={220}
        height={50}
        className={cn(
          "w-auto object-contain transition-all duration-300",
          light ? "brightness-0 invert" : "",
          variant === "footer"
            ? "h-10 sm:h-12 md:h-14"
            : "h-8 sm:h-9 md:h-10"
        )}
      />
    </Link>
  );
}
