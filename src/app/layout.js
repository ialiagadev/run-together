import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ClientLayout from './components/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RunTogether',
  description: 'Encuentra compañeros para correr en tu área',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.className}>
      <body className="bg-gradient-to-br from-purple-900/50 to-black text-white min-h-screen flex flex-col">
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
}