import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import { Task } from '../types';
import { AnalyticsData } from './analyticsService';

// Helper function to clean text for PDF (remove or replace problematic characters)
const cleanTextForPDF = (text: string): string => {
  if (!text) return '';
  return text
    // Replace Latin-1 extended characters (commonly appearing as corruption)
    .replace(/Ø/g, 'O')
    .replace(/Ü/g, 'U')
    .replace(/Ê/g, 'E')
    .replace(/À/g, 'A')
    .replace(/È/g, 'E')
    .replace(/Î/g, 'I')
    .replace(/Ô/g, 'O')
    .replace(/Û/g, 'U')
    .replace(/Â/g, 'A')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ú/g, 'U')
    .replace(/Ñ/g, 'N')
    .replace(/ñ/g, 'n')
    .replace(/Ý/g, 'Y')
    .replace(/Þ/g, 'B')
    .replace(/þ/g, 'b')
    .replace(/Ë/g, 'E')
    .replace(/Ï/g, 'I')
    .replace(/Œ/g, 'OE')
    .replace(/œ/g, 'oe')
    .replace(/Æ/g, 'AE')
    .replace(/æ/g, 'ae')
    .replace(/¿/g, '')
    .replace(/¡/g, '')
    // Replace regular accented characters
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/Á/g, 'A')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ú/g, 'U')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N')
    // Replace punctuation and special characters
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/…/g, '...')
    .replace(/™/g, '(TM)')
    .replace(/©/g, '(C)')
    .replace(/®/g, '(R)')
    .replace(/°/g, ' grados')
    .replace(/¼/g, ' 1/4')
    .replace(/½/g, ' 1/2')
    .replace(/¾/g, ' 3/4')
    // Remove any remaining non-ASCII characters
    .replace(/[^\x00-\x7F]/g, '');
};

export interface ExportOptions {
  includeCompleted?: boolean;
  includeDescription?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  priorities?: string[];
}

class ExportService {
  
  /**
   * Exportar tareas a PDF
   */
  async exportTasksToPDF(tasks: Task[], options: ExportOptions = {}): Promise<void> {
    const filteredTasks = this.filterTasks(tasks, options);
    
    // Crear nuevo documento PDF
    const doc = new jsPDF();
    
    // Configuración del documento
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    
    // Header del documento
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('TaskFlow - Reporte de Tareas'), margin, 25);
    
    // Información del reporte
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, margin, 35);
    doc.text(`Total de tareas: ${filteredTasks.length}`, margin, 42);
    
    // Estadísticas rápidas
    const completedTasks = filteredTasks.filter(t => t.completed).length;
    const pendingTasks = filteredTasks.length - completedTasks;
    
    doc.text(`Completadas: ${completedTasks}`, margin, 49);
    doc.text(`Pendientes: ${pendingTasks}`, margin + 60, 49);
    
    // Preparar datos para la tabla
    const tableData = filteredTasks.map(task => {
      const row = [
        cleanTextForPDF(task.title),
        task.completed ? '✓' : '○',
        cleanTextForPDF(task.priority || 'Media'),
        cleanTextForPDF(task.category || 'Sin categoría'),
        task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : '-',
        cleanTextForPDF(task.tags?.join(', ') || '-')
      ];
      
      if (options.includeDescription) {
        row.push(cleanTextForPDF(task.description || '-'));
      }
      
      return row;
    });
    
    // Headers de la tabla
    const headers = [
      cleanTextForPDF('Título'),
      cleanTextForPDF('Estado'), 
      cleanTextForPDF('Prioridad'),
      cleanTextForPDF('Categoría'),
      cleanTextForPDF('Vencimiento'),
      cleanTextForPDF('Etiquetas')
    ];
    
    if (options.includeDescription) {
      headers.push(cleanTextForPDF('Descripción'));
    }
    
    // Crear tabla
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 60,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Azul
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Título
        1: { cellWidth: 15, halign: 'center' }, // Estado
        2: { cellWidth: 20 }, // Prioridad
        3: { cellWidth: 25 }, // Categoría
        4: { cellWidth: 25 }, // Vencimiento
        5: { cellWidth: 'auto' }, // Etiquetas
      },
      didParseCell: (data) => {
        // Colorear filas según prioridad
        if (data.section === 'body' && data.column.index === 2) {
          const priority = data.cell.raw as string;
          if (priority === 'Alta') {
            data.cell.styles.textColor = [239, 68, 68]; // Rojo
          } else if (priority === 'Media') {
            data.cell.styles.textColor = [245, 158, 11]; // Amarillo
          } else if (priority === 'Baja') {
            data.cell.styles.textColor = [34, 197, 94]; // Verde
          }
        }
      }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      'Generado por TaskFlow - Sistema de Gestión de Tareas',
      pageWidth / 2,
      doc.internal.pageSize.height - 15,
      { align: 'center' }
    );
    
    // Descargar el PDF
    const fileName = `taskflow-tareas-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
  
  /**
   * Exportar tareas a CSV
   */
  exportTasksToCSV(tasks: Task[], options: ExportOptions = {}): void {
    const filteredTasks = this.filterTasks(tasks, options);
    
    // Preparar datos para CSV
    const csvData = filteredTasks.map(task => ({
      'Título': task.title,
      'Descripción': options.includeDescription ? (task.description || '') : undefined,
      'Estado': task.completed ? 'Completada' : 'Pendiente',
      'Prioridad': task.priority || 'Media',
      'Categoría': task.category || 'Sin categoría',
      'Etiquetas': task.tags?.join('; ') || '',
      'Fecha de vencimiento': task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : '',
      'Fecha de creación': new Date(task.created_at).toLocaleDateString('es-ES'),
      'Usuario': task.user_id
    }));
    
    // Remover campos undefined
    const cleanData = csvData.map(row => {
      const cleanRow: any = {};
      Object.entries(row).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanRow[key] = value;
        }
      });
      return cleanRow;
    });
    
    // Convertir a CSV
    const csv = Papa.unparse(cleanData, {
      delimiter: ',',
      header: true
    });
    
    // Crear blob y descargar
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const fileName = `taskflow-tareas-${new Date().toISOString().split('T')[0]}.csv`;
    
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }
  
  /**
   * Exportar analytics a PDF
   */
  async exportAnalyticsToPDF(analyticsData: AnalyticsData, chartElement?: HTMLElement): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('TaskFlow - Reporte de Analytics'), margin, 25);
    
    // Fecha del reporte
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${analyticsData.lastUpdated.toLocaleDateString('es-ES')}`, margin, 35);
    
    let currentY = 50;
    
    // Estadísticas generales
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('Estadísticas Generales'), margin, currentY);
    currentY += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const stats = [
      [cleanTextForPDF(`Total de tareas: ${analyticsData.taskStats.total}`)],
      [cleanTextForPDF(`Tareas completadas: ${analyticsData.taskStats.completed}`)],
      [cleanTextForPDF(`Tareas pendientes: ${analyticsData.taskStats.pending}`)],
      [cleanTextForPDF(`Tareas vencidas: ${analyticsData.taskStats.overdue}`)],
      [cleanTextForPDF(`Tasa de finalizacion: ${analyticsData.taskStats.completionRate}%`)]
    ];
    
    autoTable(doc, {
      body: stats,
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
      theme: 'plain'
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Productividad
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('Métricas de Productividad'), margin, currentY);
    currentY += 10;
    
    const productivityStats = [
      [cleanTextForPDF('Tareas completadas hoy'), analyticsData.productivityStats.tasksCompletedToday.toString()],
      [cleanTextForPDF('Tareas completadas esta semana'), analyticsData.productivityStats.tasksCompletedThisWeek.toString()],
      [cleanTextForPDF('Tareas completadas este mes'), analyticsData.productivityStats.tasksCompletedThisMonth.toString()],
      [cleanTextForPDF('Tiempo promedio de finalizacion'), `${analyticsData.productivityStats.averageCompletionTime.toFixed(1)} dias`],
      [cleanTextForPDF('Dia mas productivo'), cleanTextForPDF(analyticsData.productivityStats.mostProductiveDay)],
      [cleanTextForPDF('Racha actual'), `${analyticsData.productivityStats.currentStreak} dias`]
    ];
    
    autoTable(doc, {
      head: [[cleanTextForPDF('Metrica'), cleanTextForPDF('Valor')]],
      body: productivityStats,
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Distribucion por categorias
    if (analyticsData.categoryStats.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanTextForPDF('Distribucion por Categorias'), margin, currentY);
      currentY += 10;
      
      const categoryData = analyticsData.categoryStats.map(cat => [
        cleanTextForPDF(cat.name),
        cat.total.toString(),
        cat.completed.toString(),
        `${cat.percentage}%`
      ]);
      
      autoTable(doc, {
        head: [[cleanTextForPDF('Categoria'), cleanTextForPDF('Total'), cleanTextForPDF('Completadas'), cleanTextForPDF('Porcentaje')]],
        body: categoryData,
        startY: currentY,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255
        }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Capturar gráfico si se proporciona
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          scale: 2
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Verificar si necesitamos una nueva página
        if (currentY + imgHeight > doc.internal.pageSize.height - 30) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
      } catch (error) {
        console.error('Error capturing chart:', error);
      }
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      'Generado por TaskFlow - Sistema de Gestión de Tareas',
      pageWidth / 2,
      doc.internal.pageSize.height - 15,
      { align: 'center' }
    );
    
    // Descargar
    const fileName = `taskflow-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
  
  /**
   * Exportar datos raw de analytics como JSON
   */
  exportAnalyticsToJSON(analyticsData: AnalyticsData): void {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    const fileName = `taskflow-analytics-raw-${new Date().toISOString().split('T')[0]}.json`;
    
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }
  
  /**
   * Filtrar tareas según opciones
   */
  private filterTasks(tasks: Task[], options: ExportOptions): Task[] {
    let filtered = [...tasks];
    
    // Filtrar por estado completado
    if (options.includeCompleted === false) {
      filtered = filtered.filter(task => !task.completed);
    }
    
    // Filtrar por rango de fechas
    if (options.dateRange) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= options.dateRange!.start && taskDate <= options.dateRange!.end;
      });
    }
    
    // Filtrar por categorías
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter(task => 
        options.categories!.includes(task.category || '')
      );
    }
    
    // Filtrar por prioridades
    if (options.priorities && options.priorities.length > 0) {
      filtered = filtered.filter(task => 
        options.priorities!.includes(task.priority || 'medium')
      );
    }
    
    return filtered;
  }
  
  /**
   * Generar reporte completo (PDF + CSV)
   */
  async generateCompleteReport(tasks: Task[], analyticsData: AnalyticsData, chartElement?: HTMLElement): Promise<void> {
    try {
      // Exportar tareas a PDF
      await this.exportTasksToPDF(tasks, { includeDescription: true });
      
      // Exportar tareas a CSV
      this.exportTasksToCSV(tasks, { includeDescription: true });
      
      // Exportar analytics a PDF
      await this.exportAnalyticsToPDF(analyticsData, chartElement);
      
      // Exportar analytics raw
      this.exportAnalyticsToJSON(analyticsData);
      
      console.log('✅ Reporte completo generado exitosamente');
    } catch (error) {
      console.error('❌ Error generando reporte completo:', error);
      throw error;
    }
  }

  /**
   * Exportar analytics completo a PDF con nuevas funcionalidades
   */
  async exportAdvancedAnalyticsToPDF(analyticsData: AnalyticsData): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = 30;
    
    // Helper function to add new page if needed
    const checkNewPage = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };
    
    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('TaskFlow Analytics - Reporte Completo'), margin, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanTextForPDF(`Generado: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`), margin, yPosition);
    yPosition += 20;
    
    // Resumen General
    checkNewPage(60);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('Resumen General'), margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const { taskStats, productivityStats, predictions } = analyticsData;
    
    // Función para obtener indicador de estado
    const getStatusIndicator = (rate: number, overdue: number, streak: number): string => {
      if (overdue > 0) return '!';
      if (streak > 7) return '*';
      if (rate > 75) return '+';
      if (rate > 50) return '~';
      return '-';
    };
    
    // Crear tabla de resumen SIN emojis
    autoTable(doc, {
      startY: yPosition,
      head: [[cleanTextForPDF('Metrica'), cleanTextForPDF('Valor'), cleanTextForPDF('Estado')]],
      body: [
        [cleanTextForPDF('Total de Tareas'), taskStats.total.toString(), ''],
        [cleanTextForPDF('Tareas Completadas'), taskStats.completed.toString(), ''],
        [cleanTextForPDF('Tasa de Finalizacion'), `${taskStats.completionRate.toFixed(1)}%`, getStatusIndicator(taskStats.completionRate, taskStats.overdue, productivityStats.currentStreak)],
        [cleanTextForPDF('Tareas Vencidas'), taskStats.overdue.toString(), taskStats.overdue > 0 ? '!' : ''],
        [cleanTextForPDF('Racha Actual'), `${productivityStats.currentStreak} dias`, productivityStats.currentStreak > 7 ? '*' : ''],
        [cleanTextForPDF('Dia Mas Productivo'), cleanTextForPDF(productivityStats.mostProductiveDay), ''],
      ],
      margin: { left: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // Predicciones y Análisis Avanzado
    checkNewPage(80);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('Predicciones y Análisis Avanzado'), margin, yPosition);
    yPosition += 15;
    
    // Predicciones para la próxima semana
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('Predicciones para la Proxima Semana:'), margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanTextForPDF(`Tareas estimadas a completar: ${predictions.nextWeekPrediction.estimatedTasksToComplete}`), margin + 5, yPosition);
    yPosition += 6;
    doc.text(cleanTextForPDF(`Tasa de finalizacion estimada: ${predictions.nextWeekPrediction.estimatedCompletionRate}%`), margin + 5, yPosition);
    yPosition += 6;
    doc.text(cleanTextForPDF(`Confianza de la prediccion: ${Math.round(predictions.nextWeekPrediction.confidence * 100)}%`), margin + 5, yPosition);
    yPosition += 12;
    
    // Análisis de Riesgo de Burnout
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const burnoutColor = predictions.burnoutRisk.level === 'high' ? [220, 38, 38] : 
                         predictions.burnoutRisk.level === 'medium' ? [245, 158, 11] : [34, 197, 94];
    doc.setTextColor(burnoutColor[0], burnoutColor[1], burnoutColor[2]);
    doc.text(cleanTextForPDF(`Riesgo de Burnout: ${predictions.burnoutRisk.level.toUpperCase()} (${predictions.burnoutRisk.score}/100)`), margin, yPosition);
    yPosition += 8;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (predictions.burnoutRisk.factors.length > 0) {
      doc.text(cleanTextForPDF('Factores de riesgo identificados:'), margin + 5, yPosition);
      yPosition += 6;
      predictions.burnoutRisk.factors.forEach((factor, index) => {
        if (index < 3) {
          doc.text(cleanTextForPDF(`${index + 1}. ${factor}`), margin + 10, yPosition);
          yPosition += 5;
        }
      });
      yPosition += 5;
    }
    
    if (predictions.burnoutRisk.suggestions.length > 0) {
      doc.text(cleanTextForPDF('Sugerencias para mitigacion:'), margin + 5, yPosition);
      yPosition += 6;
      predictions.burnoutRisk.suggestions.slice(0, 2).forEach((suggestion, index) => {
        const lines = doc.splitTextToSize(cleanTextForPDF(`${index + 1}. ${suggestion}`), pageWidth - margin - 15);
        doc.text(lines, margin + 10, yPosition);
        yPosition += lines.length * 5 + 2;
      });
      yPosition += 5;
    }
    
    // Análisis de Tendencias
    checkNewPage(60);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('Análisis de Tendencias (Últimas 12 Semanas)'), margin, yPosition);
    yPosition += 15;
    
    if (analyticsData.trends.length > 0) {
      const trendData = analyticsData.trends.slice(-8).map(trend => [
        cleanTextForPDF(trend.period),
        trend.created.toString(),
        trend.completed.toString(),
        `${trend.completionRate}%`
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [[cleanTextForPDF('Periodo'), cleanTextForPDF('Creadas'), cleanTextForPDF('Completadas'), cleanTextForPDF('Tasa Finalizacion')]],
        body: trendData,
        margin: { left: margin },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 253, 244] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Insights Avanzados
    checkNewPage(80);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('Insights Avanzados'), margin, yPosition);
    yPosition += 15;
    
    const { advancedInsights } = analyticsData;
    
    // Balance de Carga de Trabajo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('Balance de Carga de Trabajo:'), margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const workloadColor = advancedInsights.workloadBalance.status === 'optimal' ? [34, 197, 94] :
                         advancedInsights.workloadBalance.status === 'overloaded' ? [220, 38, 38] : [245, 158, 11];
    doc.setTextColor(workloadColor[0], workloadColor[1], workloadColor[2]);
    doc.text(cleanTextForPDF(`• Estado: ${advancedInsights.workloadBalance.status.toUpperCase()} (${advancedInsights.workloadBalance.score}/100)`), margin + 5, yPosition);
    yPosition += 6;
    
    doc.setTextColor(0, 0, 0);
    const recLines = doc.splitTextToSize(cleanTextForPDF(`• Recomendación: ${advancedInsights.workloadBalance.recommendation}`), pageWidth - margin - 10);
    doc.text(recLines, margin + 5, yPosition);
    yPosition += recLines.length * 5 + 8;
    
    // Eficiencia de Tiempo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('Gestion del Tiempo:'), margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanTextForPDF(`Eficiencia en horas pico: ${advancedInsights.timeManagement.efficiency}%`), margin + 5, yPosition);
    yPosition += 6;
    doc.text(cleanTextForPDF(`Horas mas productivas: ${advancedInsights.timeManagement.peakHours.join(', ')}:00`), margin + 5, yPosition);
    yPosition += 6;
    if (advancedInsights.timeManagement.suggestions.length > 0) {
      const timeLines = doc.splitTextToSize(cleanTextForPDF(`Sugerencia: ${advancedInsights.timeManagement.suggestions[0]}`), pageWidth - margin - 10);
      doc.text(timeLines, margin + 5, yPosition);
      yPosition += timeLines.length * 5 + 8;
    }
    
    // Balance de Categorías
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('Balance de Categorias:'), margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanTextForPDF(`Categoria que necesita atencion: ${advancedInsights.categoryBalance.mostNegglected}`), margin + 5, yPosition);
    yPosition += 6;
    const catLines = doc.splitTextToSize(cleanTextForPDF(`Recomendacion: ${advancedInsights.categoryBalance.recommendation}`), pageWidth - margin - 10);
    doc.text(catLines, margin + 5, yPosition);
    yPosition += catLines.length * 5 + 10;
    
    // Recomendaciones de Objetivos
    checkNewPage(50);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTextForPDF('Objetivos Recomendados'), margin, yPosition);
    yPosition += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanTextForPDF(`Objetivo diario recomendado: ${predictions.goalRecommendations.dailyTarget} tareas`), margin + 5, yPosition);
    yPosition += 6;
    doc.text(cleanTextForPDF(`Objetivo semanal recomendado: ${predictions.goalRecommendations.weeklyTarget} tareas`), margin + 5, yPosition);
    yPosition += 8;
    
    if (predictions.goalRecommendations.focusAreas.length > 0) {
      doc.text(cleanTextForPDF('Areas de enfoque recomendadas:'), margin + 5, yPosition);
      yPosition += 6;
      predictions.goalRecommendations.focusAreas.forEach((area, index) => {
        doc.text(cleanTextForPDF(`  ${index + 1}. ${area}`), margin + 10, yPosition);
        yPosition += 5;
      });
    }
    
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 40, pageHeight - 10);
      doc.text('Generado por TaskFlow Analytics', margin, pageHeight - 10);
    }
    
    // Descargar el PDF
    const fileName = `TaskFlow-Analytics-Completo-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}

export const exportService = new ExportService();
