import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function GlassPanel({ children, className, ...rest }: Props) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-graphite-border bg-graphite/60 backdrop-blur-xl shadow-premium",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
