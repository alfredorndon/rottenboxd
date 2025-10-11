/**
 * Footer Component
 * Pie de página con atribución de TMDb
 */

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-400 text-sm text-center md:text-left">
            <p className="mb-2">
              This product uses the TMDb API but is not endorsed or certified by TMDb.
            </p>
            <p className="text-xs">
              &copy; {new Date().getFullYear()} rottenboxd. Un proyecto educativo.
            </p>
          </div>
          
          {/* Logo TMDb */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Powered by</span>
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <img 
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="The Movie Database (TMDb)"
                className="h-8"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

