import { useState, useEffect } from 'react';
import { Download, X, RefreshCw } from 'lucide-react';

interface PWAUpdateProps {
  onInstall?: () => void;
  onUpdate?: () => void;
}

const PWAUpdate: React.FC<PWAUpdateProps> = ({ onInstall, onUpdate }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // Escuchar evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Escuchar evento de actualización del service worker
    const handleSWUpdate = () => {
      setShowUpdatePrompt(true);
    };

    // Verificar si ya está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebApp = (window.navigator as any).standalone === true;
    
    if (!isStandalone && !isInWebApp) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // Registrar service worker update handler
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setShowInstallPrompt(false);
        onInstall?.();
      }
      
      setDeferredPrompt(null);
    }
  };

  const handleUpdateClick = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          setShowUpdatePrompt(false);
          onUpdate?.();
          window.location.reload();
        }
      });
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    // Recordar que el usuario rechazó la instalación
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleDismissUpdate = () => {
    setShowUpdatePrompt(false);
  };

  // No mostrar si ya fue rechazada la instalación
  const installDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';

  return (
    <>
      {/* Prompt de instalación */}
      {showInstallPrompt && !installDismissed && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">
                Instalar TaskFlow
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Instala TaskFlow en tu dispositivo para acceso rápido y una mejor experiencia.
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Instalar
                </button>
                <button
                  onClick={handleDismissInstall}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                >
                  Ahora no
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissInstall}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Prompt de actualización */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-50 border border-green-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <RefreshCw className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">
                Actualización disponible
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Hay una nueva versión de TaskFlow disponible.
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleUpdateClick}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  Actualizar
                </button>
                <button
                  onClick={handleDismissUpdate}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                >
                  Después
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissUpdate}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAUpdate;
