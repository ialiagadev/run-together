import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RunTogether',
  description: 'Encuentra compañeros para correr en tu área',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.className}>
      <body className="bg-black text-white min-h-screen flex flex-col">
        <AuthProvider>
         
          <main className="flex-grow">
            {children}
          </main>
          <footer className="py-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} RunTogether. Todos los derechos reservados.
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}