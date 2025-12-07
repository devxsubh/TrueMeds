import ClientWrapper from '@/components/ClientWrapper';
import '@/styles/globals.css';

export const metadata = {
  title: 'Counterfeit Medicine Detector',
  description: 'AI-powered medicine authenticity detection system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
