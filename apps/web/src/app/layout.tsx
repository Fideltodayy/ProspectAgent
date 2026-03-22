import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import Web3Provider from '@/providers/web3-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProspectAgent — Find customers on social, automatically',
  description:
    'AI-powered social prospecting for small businesses. Fill your company profile, let the agent find buyers in real time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Web3Provider>{children}</Web3Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
