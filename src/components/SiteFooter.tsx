import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/spelregels">Spelregels</Link>
      <span aria-hidden="true">♦</span>
      <Link href="/privacy">Privacy</Link>
    </footer>
  );
}
