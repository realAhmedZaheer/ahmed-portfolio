export function Footer() {
  return (
    <footer className="border-t border-dashed border-purple/20 px-5 py-5 text-center">
      <p className="font-pixel text-[8px] text-dim">
        © <span suppressHydrationWarning>{new Date().getFullYear()}</span> AHMED
        ZAHEER · BUILT WITH NEXT.JS · NO COINS REQUIRED
      </p>
    </footer>
  );
}
