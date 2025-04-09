import { ReactNode } from "react";

export default function ShareLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col">
      {children}
    </main>
  );
} 