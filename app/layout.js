/**
 * Root Layout
 * Layout principal con Navbar, Footer y Providers
 */

import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ClientSessionProvider from './components/ClientSessionProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'rottenboxd - Tu red social de películas',
  description: 'Descubre, califica y obtén recomendaciones personalizadas de películas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-100 min-h-screen flex flex-col`}>
        <ClientSessionProvider>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </ClientSessionProvider>
      </body>
    </html>
  );
}
