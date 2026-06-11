import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className = "" }: PageShellProps) {
  return <main className={`min-h-[calc(100vh-65px)] bg-background ${className}`}>{children}</main>;
}
