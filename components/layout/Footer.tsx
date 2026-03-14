export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-(--color-border) mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <p className="text-sm text-(--color-text-secondary)">
          © {year} Tyler Agnew
        </p>
      </div>
    </footer>
  );
}
