import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Erick & Itally | Lista de Presentes & Cotas Cinematográficas",
  description:
    "Apoie o casamento de Erick & Itally com cotas audiovisuais, sobrevivência à ilha de edição, festa, open bar e lua de mel!",
  keywords: ["casamento", "lista de presentes", "cotas de casamento", "audiovisual", "filmmaker", "pix", "mercado pago"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#FAF8F5] text-stone-800 antialiased selection:bg-rose-100 selection:text-rose-900">
        {children}
      </body>
    </html>
  );
}
