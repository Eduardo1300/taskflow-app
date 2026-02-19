import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { guidesData, Guide } from '../data/guidesData';
import { Book, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Import for GitHub Flavored Markdown

const GuidesPage: React.FC = () => {
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const toggleGuide = (id: string) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  return (
    <MainLayout currentPage="guides">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 mb-4">
            <Book className="h-10 w-10 sm:h-10 sm:w-10 text-purple-600 dark:text-purple-400 mx-auto sm:mx-0" />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">Todas las Guías</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-2">
            Explora nuestra biblioteca de guías detalladas para dominar todas las funcionalidades de TaskFlow.
          </p>
        </div>

        {/* Guides List */}
        <div className="space-y-4">
          {guidesData.map((guide: Guide) => {
            const Icon = guide.icon;
            return (
              <div
                key={guide.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
              >
                <button
                  onClick={() => toggleGuide(guide.id)}
                  className="w-full px-0 py-0 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg"
                >
                  <div className="flex items-start space-x-4 flex-grow">
                    <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex-shrink-0">
                      <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {guide.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {expandedGuide === guide.id ? (
                      <ChevronDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedGuide === guide.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {guide.fullContent ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {guide.fullContent}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {guide.steps.map((step, index) => (
                          <li key={index} className="text-sm">{step}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Need Help Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 sm:p-12 text-center text-white shadow-xl">
          <Lightbulb className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-xl sm:text-2xl font-bold mb-3">
            ¿Aún necesitas ayuda?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto text-sm sm:text-lg">
            Nuestro equipo de soporte está disponible 24/7 para ayudarte. No dudes en contactarnos con cualquier pregunta o problema.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button className="flex items-center justify-center px-6 sm:px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm sm:text-base">
              Chat en Vivo
            </button>
            <button className="flex items-center justify-center px-6 sm:px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors font-semibold border border-blue-500 text-sm sm:text-base">
              Enviar Email
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GuidesPage;
