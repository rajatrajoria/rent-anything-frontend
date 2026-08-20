export function Footer() {
  return (
    <footer className="mt-auto border-t py-8">
      <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Rent Anything. A peer-to-peer rental marketplace.</p>
      </div>
    </footer>
  );
}
