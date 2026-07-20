"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesColumnIncreasing, House, UserRound, Vote } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: House },
  { href: "/voorspellingen", label: "Stemmen", icon: Vote },
  { href: "/leaderboard", label: "Leaderboard", icon: ChartNoAxesColumnIncreasing },
  { href: "/profiel", label: "Profiel", icon: UserRound },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Hoofdnavigatie">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
