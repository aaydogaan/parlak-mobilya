import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBanner } from "@/components/sections/CtaBanner";

type Props = {
  children: ReactNode;
  variant?: "light" | "dark" | "transparent";
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showCta?: boolean;
  customHero?: ReactNode;
};

export function SiteLayout({
  children,
  variant = "dark",
  title,
  subtitle,
  eyebrow,
  showCta = true,
  customHero,
}: Props) {
  return (
    <div className="min-h-screen bg-white text-ink overflow-x-hidden w-full max-w-full">
      {customHero ? (
        customHero
      ) : variant === "transparent" ? (
        <Header variant="transparent" />
      ) : variant === "light" ? (
        <Header variant="light" />
      ) : (
        <div className="bg-[#271d12]">
          <Header variant="dark" />
          {title ? <PageHero title={title} subtitle={subtitle} eyebrow={eyebrow} /> : null}
        </div>
      )}
      {children}
      {showCta ? <CtaBanner /> : null}
      <Footer />
    </div>
  );
}
