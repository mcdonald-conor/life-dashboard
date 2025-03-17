import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TaskProvider } from '@/contexts/task-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Life Dashboard',
  description: 'A comprehensive dashboard for managing your life',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TaskProvider>
          {children}
        </TaskProvider>
      </body>
    </html>
  )
}
