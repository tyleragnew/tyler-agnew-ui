import Nav from "./Nav";
import Link from "next/link";

export default function Header() {
  return (
    <header className="relative border-b border-(--color-border) bg-(--color-surface)">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl font-bold text-(--color-text-primary) hover:text-(--color-accent) transition-colors"
        >
          Tyler Agnew
        </Link>
        <Nav />
      </div>
    </header>
  );
}
