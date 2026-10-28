import { DM_Sans, Fraunces } from 'next/font/google';
import ClientWrapper from '@/components/ClientWrapper';
import '@/styles/globals.css';

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata = {
  title: 'TrueMeds — AI packaging lab',
  description:
    'Chat-native medicine packaging intelligence: authenticity, chemical composition, and alternatives.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
