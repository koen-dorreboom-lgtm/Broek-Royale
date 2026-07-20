import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { CircleCheck, Inbox } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function PrimaryButton({ children, className = "", ...props }: ButtonProps) {
  return <button className={`button button--primary ${className}`} {...props}>{children}</button>;
}

export function SecondaryButton({ children, className = "", ...props }: ButtonProps) {
  return <button className={`button button--secondary ${className}`} {...props}>{children}</button>;
}

export function ButtonLink({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link href={href} className={`button ${secondary ? "button--secondary" : "button--primary"}`}>{children}</Link>;
}

export function CasinoCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`casino-card ${className}`}>{children}</section>;
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="progress" role="progressbar" aria-label="Voortgang voorspellingen" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className="progress__fill" style={{ width: `${percentage}%` }} />
    </div>
  );
}

export function InlineSuccess({ children }: { children: ReactNode }) {
  return <div className="notice notice--success" role="status"><CircleCheck size={19} />{children}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><Inbox size={28} /><strong>{title}</strong><p>{description}</p></div>;
}
