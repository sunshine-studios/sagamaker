import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header';
import { HabitsProvider } from '@/context/HabitsContext';
import { XPProvider } from '@/context/XPContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Saga Maker',
  description: 'Personal development and skill tracking application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <XPProvider>
          <HabitsProvider>
            <Header />
            {children}
          </HabitsProvider>
        </XPProvider>
      </body>
    </html>
  )
}
