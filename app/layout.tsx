import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kantin Cashless Sekolah",
  description: "Pembayaran kantin tanpa tunai untuk siswa",
};

const NAV = [
  { href: "/", label: "Kasir" },
  { href: "/siswa", label: "Siswa" },
  { href: "/riwayat", label: "Riwayat" },
  { href: "/produk", label: "Produk" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen text-slate-900">
        <header className="bg-slate-900 text-white">
          <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3">
            <span className="mr-4 font-bold">Kantin Cashless</span>
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
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
