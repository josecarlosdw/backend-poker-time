import { Injectable } from '@angular/core';
import { Session } from './session.service';

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeVotes?: boolean;
  includeCharts?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() {}

  exportSession(session: Session, options: ExportOptions): void {
    switch (options.format) {
      case 'pdf':
        this.exportToPDF(session, options);
        break;
      case 'excel':
        this.exportToExcel(session, options);
        break;
      case 'csv':
        this.exportToCSV(session, options);
        break;
    }
  }

  private exportToPDF(session: Session, options: ExportOptions): void {
    // Implementação básica - em produção usar biblioteca como jsPDF
    const content = this.generatePDFContent(session, options);
    const blob = new Blob([content], { type: 'application/pdf' });
    this.downloadFile(blob, `${session.title}_resultado.pdf`);
  }

  private exportToExcel(session: Session, options: ExportOptions): void {
    // Implementação básica - em produção usar biblioteca como xlsx
    const content = this.generateExcelContent(session, options);
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.downloadFile(blob, `${session.title}_resultado.xlsx`);
  }

  private exportToCSV(session: Session, options: ExportOptions): void {
    const content = this.generateCSVContent(session, options);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `${session.title}_resultado.csv`);
  }

  private generatePDFContent(session: Session, options: ExportOptions): string {
    let content = `
      <html>
        <head>
          <title>${session.title} - Resultado</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .result { font-size: 24px; font-weight: bold; color: #1976d2; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${session.title}</h1>
            <p>Data: ${new Date(session.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
          
          <h2>Resultados</h2>
          <div class="result">
            Média: ${session.result?.average?.toFixed(1) || 'N/A'}
          </div>
          
          <table>
            <tr>
              <th>Métrica</th>
              <th>Valor</th>
            </tr>
            <tr>
              <td>Média</td>
              <td>${session.result?.average?.toFixed(1) || 'N/A'}</td>
            </tr>
            <tr>
              <td>Mediana</td>
              <td>${session.result?.median || 'N/A'}</td>
            </tr>
            <tr>
              <td>Mínimo</td>
              <td>${session.result?.min || 'N/A'}</td>
            </tr>
            <tr>
              <td>Máximo</td>
              <td>${session.result?.max || 'N/A'}</td>
            </tr>
          </table>
    `;

    if (options.includeVotes && session.votes.length > 0) {
      content += `
          <h2>Votos</h2>
          <table>
            <tr>
              <th>Participante</th>
              <th>Voto</th>
              <th>Data</th>
            </tr>
      `;
      
      session.votes.forEach(vote => {
        content += `
            <tr>
              <td>${vote.user.username}</td>
              <td>${vote.card}</td>
              <td>${new Date(vote.votedAt).toLocaleDateString('pt-BR')}</td>
            </tr>
        `;
      });
      
      content += '</table>';
    }

    content += `
        </body>
      </html>
    `;

    return content;
  }

  private generateExcelContent(session: Session, options: ExportOptions): string {
    // Implementação básica - retorna CSV como fallback
    return this.generateCSVContent(session, options);
  }

  private generateCSVContent(session: Session, options: ExportOptions): string {
    let csv = 'Métrica,Valor\n';
    csv += `Média,${session.result?.average?.toFixed(1) || 'N/A'}\n`;
    csv += `Mediana,${session.result?.median || 'N/A'}\n`;
    csv += `Mínimo,${session.result?.min || 'N/A'}\n`;
    csv += `Máximo,${session.result?.max || 'N/A'}\n`;

    if (options.includeVotes && session.votes.length > 0) {
      csv += '\nParticipante,Voto,Data\n';
      session.votes.forEach(vote => {
        csv += `${vote.user.username},${vote.card},${new Date(vote.votedAt).toLocaleDateString('pt-BR')}\n`;
      });
    }

    return csv;
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
} 