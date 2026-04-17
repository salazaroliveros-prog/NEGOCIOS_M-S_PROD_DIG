import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      let errorDetails: any = null;
      try {
        if (this.state.error?.message) {
          errorDetails = JSON.parse(this.state.error.message);
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-panel border border-border rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Algo salió mal</h2>
            <p className="text-text-dim text-sm mb-8">
              {errorDetails 
                ? 'Hubo un problema al conectar con la base de datos. Por favor, verifica tu conexión o intenta más tarde.'
                : 'Ha ocurrido un error inesperado en la aplicación.'}
            </p>

            {errorDetails && (
              <div className="bg-bg/50 rounded-lg p-4 mb-8 text-left border border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Detalles del Error</p>
                <div className="space-y-1">
                  <p className="text-[10px] text-text-dim"><span className="text-white">Operación:</span> {errorDetails.operationType}</p>
                  <p className="text-[10px] text-text-dim"><span className="text-white">Ruta:</span> {errorDetails.path}</p>
                  <p className="text-[10px] text-text-dim truncate"><span className="text-white">Mensaje:</span> {errorDetails.error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-accent text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reintentar
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-panel border border-border text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-bg transition-all"
              >
                <Home className="w-4 h-4" /> Inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
