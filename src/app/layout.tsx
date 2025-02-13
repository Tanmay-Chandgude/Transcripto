import Navbar from '@/components/Navbar'
import { cn } from '@/lib/utils'  // Fixed import
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Metadata for the page, including favicon
export const metadata = {
  icons: {
    icon: '/favicon.png', 
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='light'>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body
        className={cn(
          'min-h-screen font-sans antialiased grainy',
          inter.className
        )}
      >
        <Navbar />
        {children}
      </body>
    </html>
  )
}
