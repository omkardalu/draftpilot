import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DraftPilot — Finish what you started',
  description: 'Paste unfinished work. Get ready-to-use output instantly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
