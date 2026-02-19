import React, { useState, useEffect } from 'react';
import { Bot, Lightbulb, Clock, Tag, Zap, Sparkles, X, Check } from 'lucide-react';
import { aiService, AISuggestion } from '../../services/aiService';

interface AISuggestionsProps {
  title: string;
  description: string;
  onSuggestionAccept: (type: 'category' | 'due_date' | 'priority', value: any) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  title,
  description,
  onSuggestionAccept
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (title.trim() && title.length >= 3) {
      const timeoutId = setTimeout(() => {
        generateSuggestions();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [title, description]);

  const generateSuggestions = async () => {
    if (!title.trim() || title.length < 3) return;

    setLoading(true);
    try {
      const newSuggestions = await aiService.getAllSuggestions(title, description);
      setSuggestions(newSuggestions.filter(s => !acceptedIds.has(s.id)));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = (suggestion: AISuggestion) => {
    const value = suggestion.action?.value;
    if (value) {
      onSuggestionAccept(suggestion.type as 'category' | 'due_date' | 'priority', value);
      setAcceptedIds(prev => new Set([...prev, suggestion.id]));
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    }
  };

  const handleDismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'category': return Tag;
      case 'due_date': return Clock;
      case 'priority': return Zap;
      default: return Lightbulb;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'category': return {
        icon: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        badge: 'text-blue-700 dark:text-blue-300',
        btn: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
      };
      case 'due_date': return {
        icon: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/30',
        badge: 'text-green-700 dark:text-green-300',
        btn: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
      };
      case 'priority': return {
        icon: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/30',
        badge: 'text-orange-700 dark:text-orange-300',
        btn: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
      };
      default: return {
        icon: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/30',
        badge: 'text-purple-700 dark:text-purple-300',
        btn: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
      };
    }
  };

  const formatSuggestionValue = (type: string, value: any) => {
    switch (type) {
      case 'category':
        return value.charAt(0).toUpperCase() + value.slice(1);
      case 'due_date':
        return new Date(value).toLocaleDateString('es-ES', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      case 'priority':
        const labels: Record<string, string> = {
          baja: 'Baja',
          media: 'Media',
          alta: 'Alta',
          high: 'Alta',
          medium: 'Media',
          low: 'Baja'
        };
        return labels[value] || value;
      default:
        return value;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getConfidenceWidth = (confidence: number) => {
    return `${confidence * 100}%`;
  };

  if (!showSuggestions && !loading) {
    return (
      <button
        onClick={() => setShowSuggestions(true)}
        className="flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mt-3"
      >
        <Sparkles className="h-4 w-4 mr-1" />
        Mostrar sugerencias de IA
      </button>
    );
  }

  const displaySuggestions = suggestions.filter(s => !acceptedIds.has(s.id));

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Sugerencias IA
          </h4>
          {loading && (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-purple-600 dark:text-purple-400 ml-1">Analizando...</span>
            </div>
          )}
        </div>
        {displaySuggestions.length > 0 && (
          <button
            onClick={() => setShowSuggestions(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {loading && displaySuggestions.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-purple-500 animate-spin" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Analizando tu tarea
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Evaluando patrones y generando sugerencias personalizadas...
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      ) : displaySuggestions.length > 0 ? (
        <div className="space-y-3">
          {displaySuggestions.map((suggestion) => {
            const Icon = getSuggestionIcon(suggestion.type);
            const colors = getSuggestionColor(suggestion.type);
            const confidence = Math.round(suggestion.confidence * 100);
            
            return (
              <div
                key={suggestion.id}
                className={`${colors.bg} rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${colors.icon}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${colors.badge} capitalize`}>
                          {suggestion.type === 'category' ? '📁 Categoría' : 
                           suggestion.type === 'due_date' ? '📅 Fecha' : 
                           suggestion.type === 'priority' ? '⚡ Prioridad' : '💡 Sugerencia'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {suggestion.description}
                      </p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              confidence >= 80 ? 'bg-green-500' : 
                              confidence >= 60 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}
                            style={{ width: getConfidenceWidth(suggestion.confidence) }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                          {confidence}%
                        </span>
                      </div>
                      
                      <div className="mt-2 inline-flex items-center px-2.5 py-1 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                        {formatSuggestionValue(suggestion.type, suggestion.action?.value)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      className={`flex items-center px-3 py-1.5 text-xs text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 ${colors.btn}`}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Aplicar
                    </button>
                    <button
                      onClick={() => handleDismissSuggestion(suggestion.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>La IA aprende de tus preferencias para mejorar</span>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
            <Bot className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {acceptedIds.size > 0 
                ? '¡Todas las sugerencias han sido aplicadas!' 
                : 'Escribe más detalles sobre tu tarea para recibir sugerencias personalizadas.'}
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default AISuggestions;
