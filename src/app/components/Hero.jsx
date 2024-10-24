'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <div className="min-h-screen bg-black">
      <main>
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900 to-indigo-900"></div>
          
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="absolute h-0.5 bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 300 + 50}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `runningLine ${Math.random() * 3 + 2}s linear infinite`
                }}
              ></div>
            ))}
          </div>

          <div className="relative z-10 text-center px-4">
            <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 font-display">
              Run-Together
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Corre. Conecta. Comparte la pasión.
            </p>
            <div className="space-x-4">
              <Link href="/signin" className="inline-block py-3 px-8 text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full hover:from-purple-600 hover:to-indigo-700 transition duration-300 transform hover:scale-105">
                Iniciar Sesión
              </Link>
              <Link href="/signup" className="inline-block py-3 px-8 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 transition duration-300 transform hover:scale-105">
                Registrarse <ArrowRight className="inline-block ml-2" size={20} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');

        .font-display {
          font-family: 'Orbitron', sans-serif;
        }

        @keyframes runningLine {
          0% {
            opacity: 0;
            transform: translateX(-100%) rotate(0deg);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(100%) rotate(0deg);
          }
        }
      `}</style>
    </div>
  )
}