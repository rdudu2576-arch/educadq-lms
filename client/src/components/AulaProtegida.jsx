// components/AulaProtegida.jsx
import { useEffect } from 'react';

export function AulaProtegida({ children, conteudo }) {
  useEffect(() => {
    // Bloquear CTRL+C
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
      }
      // Bloquear CTRL+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
      }
    };

    // Bloquear seleção de texto
    const handleSelectStart = (e) => {
      e.preventDefault();
    };

    // Bloquear botão direito
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div className="user-select-none">
      {children || <div dangerouslySetInnerHTML={{ __html: conteudo }} />}
    </div>
  );
}
