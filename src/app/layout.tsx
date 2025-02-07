import Navbar from '@/components/Navbar'
import { cn,  } from '@/lib/utils'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Metadata for the page, including favicon
export const metadata = {
  icons: {
    icon: '/public/favicon.ico', // Favicon link
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
         {/* Favicon link */}
         <link rel="icon" href="/public/favicon.ico" sizes="any" />
      </head>
        <body
          className={cn(
            'min-h-screen font-sans antialiased grainy',
            inter.className
          )}>
          <Navbar />
          {children}
        </body>
    </html>
  )
}