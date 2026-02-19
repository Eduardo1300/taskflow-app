import React, { useState } from 'react';
import { Download, FileText, Calendar, BarChart3, TrendingUp, CheckCircle, FileDown, Brain } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { exportService } from '../../services/exportService';
import { AnalyticsData } from '../../services/analyticsService';

interface ExportPDFProps {
  events: any[];
  metrics: any;
  insights: any;
  healthScore: any;
  burnoutRisk: any;
  dateRange: { start: Date; end: Date };
  analyticsData?: AnalyticsData;
}

const ExportPDF: React.FC<ExportPDFProps> = ({
  metrics,
  insights,
  healthScore,
  burnoutRisk,
  dateRange,
  analyticsData
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeMetrics: true,
    includeInsights: true,
    includeRecommendations: true,
    includeForecast: false
  });

  const generatePDF = async (type: 'summary' | 'detailed' | 'executive') => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 20;

      // Add title and header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TaskFlow - Reporte de Analytics', pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Período: ${format(dateRange.start, 'dd MMM yyyy', { locale: es })} - ${format(dateRange.end, 'dd MMM yyyy', { locale: es })}`,
        pageWidth / 2,
        currentY,
        { align: 'center' }
      );

      currentY += 15;

      if (type === 'executive') {
        await generateExecutiveSummary(pdf, currentY, pageWidth);
      } else if (type === 'detailed') {
        await generateDetailedReport(pdf, currentY, pageWidth, pageHeight);
      } else {
        await generateSummaryReport(pdf, currentY, pageWidth);
      }

      // Save the PDF
      const fileName = `taskflow-analytics-${type}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generando el reporte PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAdvancedExport = async () => {
    if (!analyticsData) {
      alert('No hay datos de analytics disponibles');
      return;
    }
    
    setIsExporting(true);
    try {
      await exportService.exportAdvancedAnalyticsToPDF(analyticsData);
    } catch (error) {
      console.error('Error generating advanced PDF:', error);
      alert('Error generando el reporte avanzado');
    } finally {
      setIsExporting(false);
    }
  };

  const generateExecutiveSummary = async (pdf: jsPDF, startY: number, pageWidth: number) => {
    let currentY = startY;

    // Executive Summary Box
    pdf.setDrawColor(139, 92, 246);
    pdf.setFillColor(249, 247, 255);
    pdf.roundedRect(20, currentY, pageWidth - 40, 60, 5, 5, 'FD');
    
    currentY += 15;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(139, 92, 246);
    pdf.text('Resumen Ejecutivo', 30, currentY);

    currentY += 15;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const executiveText = [
      `• Total de eventos: ${metrics.totalEvents}`,
      `• Tasa de finalización: ${metrics.completionRate}%`,
      `• Puntuación de salud del calendario: ${healthScore.score}/100`,
      `• Nivel de burnout: ${burnoutRisk.level.toUpperCase()}`,
      `• Promedio de eventos por día: ${metrics.averageEventsPerDay}`
    ];

    executiveText.forEach(text => {
      pdf.text(text, 30, currentY);
      currentY += 6;
    });

    currentY += 20;

    // Key Insights
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(139, 92, 246);
    pdf.text('Insights Principales', 30, currentY);

    currentY += 10;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const keyInsights = [
      `Horas más productivas: ${insights.peakProductivityHours.map((h: number) => `${h}:00`).join(', ')}`,
      `Balance trabajo-vida: ${insights.workLifeBalance.ratio}:1`,
      `Días más ocupados: ${insights.busyDays.join(', ') || 'Ninguno'}`,
      `Eventos colaborativos: ${metrics.collaborativeEvents} (${Math.round((metrics.collaborativeEvents/metrics.totalEvents)*100)}%)`
    ];

    keyInsights.forEach(insight => {
      const lines = pdf.splitTextToSize(insight, pageWidth - 60);
      pdf.text(lines, 30, currentY);
      currentY += lines.length * 5;
    });

    currentY += 15;

    // Recommendations
    if (healthScore.recommendations.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(139, 92, 246);
      pdf.text('Recomendaciones Clave', 30, currentY);

      currentY += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      healthScore.recommendations.slice(0, 3).forEach((rec: string, index: number) => {
        const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 60);
        pdf.text(lines, 30, currentY);
        currentY += lines.length * 6;
      });
    }
  };

  const generateDetailedReport = async (pdf: jsPDF, startY: number, pageWidth: number, pageHeight: number) => {
    let currentY = startY;

    // Check if we need a new page
    const checkNewPage = (requiredSpace: number) => {
      if (currentY + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        currentY = 20;
      }
    };

    // Metrics Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(139, 92, 246);
    pdf.text('Métricas Detalladas', 30, currentY);
    currentY += 15;

    // Metrics table
    const metricsData = [
      ['Total de eventos', metrics.totalEvents.toString()],
      ['Eventos completados', metrics.completedEvents.toString()],
      ['Eventos próximos', metrics.upcomingEvents.toString()],
      ['Eventos vencidos', metrics.overdueEvents.toString()],
      ['Tasa de finalización', `${metrics.completionRate}%`],
      ['Promedio por día', metrics.averageEventsPerDay.toString()],
      ['Día más productivo', metrics.mostProductiveDay],
      ['Hora más productiva', `${metrics.mostProductiveHour}:00`],
      ['Eventos colaborativos', metrics.collaborativeEvents.toString()],
      ['Eventos recurrentes', metrics.recurringEvents.toString()]
    ];

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    metricsData.forEach(([key, value]) => {
      checkNewPage(8);
      pdf.text(`${key}:`, 30, currentY);
      pdf.text(value, 120, currentY);
      currentY += 8;
    });

    currentY += 10;
    checkNewPage(20);

    // Calendar Health Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(139, 92, 246);
    pdf.text('Salud del Calendario', 30, currentY);
    currentY += 15;

    pdf.setFontSize(14);
    pdf.text(`Puntuación General: ${healthScore.score}/100`, 30, currentY);
    currentY += 10;

    // Health factors
    const healthFactors = Object.entries(healthScore.factors);
    pdf.setFontSize(10);
    
    healthFactors.forEach(([factor, score]) => {
      checkNewPage(8);
      const factorName = factor.replace(/([A-Z])/g, ' $1').toLowerCase();
      pdf.text(`${factorName}: ${score}/100`, 30, currentY);
      currentY += 8;
    });

    currentY += 10;
    checkNewPage(20);

    // Burnout Risk Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(139, 92, 246);
    pdf.text('Análisis de Burnout', 30, currentY);
    currentY += 15;

    pdf.setFontSize(12);
    pdf.text(`Nivel de riesgo: ${burnoutRisk.level.toUpperCase()}`, 30, currentY);
    currentY += 8;
    pdf.text(`Puntuación: ${burnoutRisk.score}/100`, 30, currentY);
    currentY += 15;

    // Burnout indicators
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Indicadores de Riesgo:', 30, currentY);
    currentY += 8;

    pdf.setFont('helvetica', 'normal');
    const indicators = Object.entries(burnoutRisk.indicators);
    indicators.forEach(([indicator, score]) => {
      checkNewPage(8);
      const indicatorName = indicator.replace(/([A-Z])/g, ' $1').toLowerCase();
      pdf.text(`${indicatorName}: ${score}/100`, 35, currentY);
      currentY += 6;
    });

    currentY += 10;
    checkNewPage(20);

    // Recommendations Section
    if (healthScore.recommendations.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(139, 92, 246);
      pdf.text('Recomendaciones', 30, currentY);
      currentY += 15;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      healthScore.recommendations.forEach((rec: string, index: number) => {
        checkNewPage(15);
        const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 60);
        pdf.text(lines, 30, currentY);
        currentY += lines.length * 6 + 3;
      });
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })} por TaskFlow Analytics`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  const generateSummaryReport = async (pdf: jsPDF, startY: number, pageWidth: number) => {
    let currentY = startY;

    // Quick Stats Box
    pdf.setDrawColor(59, 130, 246);
    pdf.setFillColor(239, 246, 255);
    pdf.roundedRect(20, currentY, pageWidth - 40, 80, 5, 5, 'FD');

    currentY += 15;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text('Estadísticas Rápidas', 30, currentY);

    currentY += 15;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const quickStats = [
      [`Total eventos: ${metrics.totalEvents}`, `Completados: ${metrics.completedEvents}`],
      [`Tasa finalización: ${metrics.completionRate}%`, `Promedio/día: ${metrics.averageEventsPerDay}`],
      [`Salud calendario: ${healthScore.score}/100`, `Riesgo burnout: ${burnoutRisk.level}`]
    ];

    quickStats.forEach(([left, right]) => {
      pdf.text(left, 30, currentY);
      pdf.text(right, 120, currentY);
      currentY += 8;
    });

    currentY += 20;

    // Top Insights
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text('Insights Principales', 30, currentY);

    currentY += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const topInsights = [
      `Horas productivas: ${insights.peakProductivityHours.map((h: number) => `${h}:00`).join(', ')}`,
      `Balance trabajo/vida: ${insights.workLifeBalance.ratio}:1`,
      `Bloques de concentración: ${insights.focusTimeBlocks.length} disponibles`
    ];

    topInsights.forEach(insight => {
      const lines = pdf.splitTextToSize(insight, pageWidth - 60);
      pdf.text(lines, 30, currentY);
      currentY += lines.length * 5 + 2;
    });

    currentY += 15;

    // Quick Recommendations
    if (healthScore.recommendations.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text('Recomendaciones Rápidas', 30, currentY);

      currentY += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      healthScore.recommendations.slice(0, 3).forEach((rec: string) => {
        const lines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 60);
        pdf.text(lines, 30, currentY);
        currentY += lines.length * 5 + 2;
      });
    }
  };

  const captureChartsAndExport = async () => {
    setIsExporting(true);

    try {
      // Find chart containers
      const chartElements = document.querySelectorAll('[data-export-chart]');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let isFirstPage = true;

      // Add title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TaskFlow - Gráficos de Analytics', pageWidth / 2, 20, { align: 'center' });

      let currentY = 40;

      for (let i = 0; i < chartElements.length; i++) {
        const element = chartElements[i] as HTMLElement;
        
        if (!isFirstPage) {
          pdf.addPage();
          currentY = 20;
        }

        try {
          const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            logging: false
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 20;
          
        } catch (error) {
          console.warn('Error capturing chart:', error);
          pdf.setFontSize(12);
          pdf.text(`Error capturando gráfico ${i + 1}`, 20, currentY);
          currentY += 20;
        }

        isFirstPage = false;
      }

      pdf.save(`taskflow-charts-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

    } catch (error) {
      console.error('Error exporting charts:', error);
      alert('Error exportando gráficos');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Exportar Reportes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Genera reportes PDF de tus analytics
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white">Opciones de Exportación</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(exportOptions).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setExportOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {key === 'includeCharts' ? 'Incluir gráficos' :
                 key === 'includeMetrics' ? 'Incluir métricas' :
                 key === 'includeInsights' ? 'Incluir insights' :
                 key === 'includeRecommendations' ? 'Incluir recomendaciones' :
                 'Incluir pronósticos'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="space-y-4">
        {/* Advanced Export Button */}
        {analyticsData && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center mb-4">
              <Brain className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                  Reporte Avanzado con IA
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Incluye predicciones, análisis de burnout y recomendaciones personalizadas
                </p>
              </div>
            </div>
            
            <button
              onClick={handleAdvancedExport}
              disabled={isExporting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg px-6 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generando Reporte Avanzado...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FileDown className="h-5 w-5 mr-3" />
                  Exportar Analytics Completo con IA
                </div>
              )}
            </button>
          </div>
        )}

        {/* Standard Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => generatePDF('summary')}
            disabled={isExporting}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isExporting ? 'Generando...' : 'Resumen'}
          </button>

          <button
            onClick={() => generatePDF('detailed')}
            disabled={isExporting}
            className="flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {isExporting ? 'Generando...' : 'Detallado'}
          </button>

          <button
            onClick={() => generatePDF('executive')}
            disabled={isExporting}
            className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {isExporting ? 'Generando...' : 'Ejecutivo'}
          </button>

          <button
            onClick={captureChartsAndExport}
            disabled={isExporting}
            className="flex items-center justify-center px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {isExporting ? 'Generando...' : 'Gráficos'}
          </button>
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-start space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium mb-1">Tipos de Reporte:</p>
            <ul className="space-y-1 text-xs">
              <li><strong>Resumen:</strong> Métricas clave y insights principales</li>
              <li><strong>Detallado:</strong> Análisis completo con todas las métricas</li>
              <li><strong>Ejecutivo:</strong> Vista de alto nivel para directivos</li>
              <li><strong>Gráficos:</strong> Solo visualizaciones de datos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPDF;
