
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AquaLens Pro | Water Quality Analyzer',
  description: 'Analyze water test strips with AI-powered color recognition.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-gradient-to-br from-[#667eea] to-[#764ba2] min-h-screen">
        {children}
      </body>
    </html>
  );
}
