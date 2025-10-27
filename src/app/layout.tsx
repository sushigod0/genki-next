import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GENKII FILMS – NEPAL | Visual Storyteller",
  description: "Genkii Films is a visual storyteller based in Kathmandu, Nepal documenting skateboarding, streets, and the culture that connects us. Capturing the raw energy of street culture in the heart of the Himalayas.",
  keywords: "Genkii Films, Nepal, Kathmandu, skateboarding, street culture, visual storytelling, documentary, films, urban Nepal",
  authors: [{ name: "Genkii Films" }],
  openGraph: {
    title: "GENKII FILMS – Visual Storyteller from Nepal",
    description: "Documenting skateboarding, streets, and the culture that connects us in Kathmandu, Nepal.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GENKII FILMS – Visual Storyteller from Nepal",
    description: "Documenting skateboarding, streets, and the culture that connects us in Kathmandu, Nepal.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/nexa/Nexa-ExtraLight.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/nexa/Nexa-Heavy.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}