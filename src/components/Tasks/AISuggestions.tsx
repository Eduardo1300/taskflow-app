import React, { useState, useEffect } from 'react';
import { Bot, Lightbulb, Clock, Tag, Zap } from 'lucide-react';
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
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (title.trim() && description.trim()) {
      generateSuggestions();
    }
  }, [title, description]);

  const generateSuggestions = async () => {
    if (!title.trim() || title.length < 3) return;

    setLoading(true);
    try {
      const newSuggestions = await aiService.getAllSuggestions(title, description);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
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
    }
    
    // Remover la sugerencia aceptada
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
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
      case 'category': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'due_date': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'priority': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      default: return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
    }
  };

  const formatSuggestionValue = (type: string, value: any) => {
    switch (type) {
      case 'category':
        return value;
      case 'due_date':
        return new Date(value).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      case 'priority':
        const priorityLabels = {
          'baja': 'Baja',
          'media': 'Media',
          'alta': 'Alta',
          'urgente': 'Urgente'
        };
        return priorityLabels[value as keyof typeof priorityLabels] || value;
      default:
        return value;
    }
  };

  if (!showSuggestions && !loading) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
      <div className="flex items-center mb-3">
        <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Sugerencias de IA
        </h4>
        {loading && (
          <div className="ml-2 h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      {loading && suggestions.length === 0 ? (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <p className="text-sm text-purple-600 dark:text-purple-400">
            Analizando tu tarea para generar sugerencias...
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion) => {
            const Icon = getSuggestionIcon(suggestion.type);
            return (
              <div
                key={suggestion.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className={`p-1.5 rounded-lg mr-3 ${getSuggestionColor(suggestion.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {formatSuggestionValue(suggestion.type, suggestion.action?.value)}
                    </p>
                  </div>
                  <div className="flex items-center ml-2">
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                      {Math.round(suggestion.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAcceptSuggestion(suggestion)}
                  className="ml-3 px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Usar
                </button>
              </div>
            );
          })}
          {suggestions.length === 0 && !loading && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay sugerencias disponibles para esta tarea.
              </p>
            </div>
          )}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>💡 La IA aprende de tus patrones para mejorar las sugerencias</span>
          <button
            onClick={() => setShowSuggestions(false)}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            Ocultar
          </button>
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
