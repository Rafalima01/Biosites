import './painel.css';
import './painel-agenda.css';
import './painel-telas.css';
import './painel-menu.css';
import './painel-financeiro.css';

export const metadata = {
  title: 'Agenda · Painel do studio',
  robots: { index: false },
  applicationName: 'Agenda',
  appleWebApp: { capable: true, title: 'Agenda', statusBarStyle: 'default' },
  icons: { icon: '/icone-192.png', apple: '/apple-touch-icon.png' },
};
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f4f5f7' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
