            <a href="#courses" className="text-slate-300 hover:text-teal-400 transition-colors">Cursos</a>
            <Link href="/cursos-gratuitos" className="text-slate-300 hover:text-teal-400 transition-colors">Grátis</Link>
            <Link href="/artigos" className="text-slate-300 hover:text-teal-400 transition-colors">Artigos</Link>
            <a href="#about" className="text-slate-300 hover:text-teal-400 transition-colors">Sobre</a>
            <a href="https://wa.me/5541988913431" target="_blank" className="text-slate-300 hover:text-teal-400 transition-colors">Contato</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>