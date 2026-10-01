import { DEFAULT_IMAGE, cn } from "@/lib/utils";

type Props = {
  alt: string;
  className?: string;
};

export function PhImg({ alt, className }: Props) {
  return (
    <img
      src={DEFAULT_IMAGE}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
