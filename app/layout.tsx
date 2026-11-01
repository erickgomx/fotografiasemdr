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
  title: "Erick & Itally | Lista de Presentes Cinematográficos",
  description:
    "Apoie o casamento de Erick & Itally com presentes audiovisuais, sobrevivência à ilha de edição, festa e lua de mel!",
  keywords: ["casamento", "lista de presentes", "presentes de casamento", "audiovisual", "filmmaker", "pix", "mercado pago"],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#FAF9F6] text-stone-800 antialiased selection:bg-stone-200 selection:text-stone-900">
        {children}
      </body>
    </html>
  );
}
