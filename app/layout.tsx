import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ekspedisi Cepat",
  description: "Pencatatan paket, scan hub, dan tracking resi",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/paket", label: "Paket" },
  { href: "/scan", label: "Scan Hub" },
  { href: "/lacak", label: "Lacak Resi" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen text-slate-900">
        <header className="bg-slate-900 text-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
            <h1 className="text-lg font-bold">Ekspedisi Cepat</h1>
            <nav className="flex gap-1">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="rounded px-3 py-1.5 text-sm hover:bg-slate-700"
                >
                  {n.label}
                </a>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
