import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Download, Calendar, TrendingUp, Users, 
  MessageSquare, CheckCircle, RefreshCw 
} from 'lucide-react';
import './App.css';

// Configuração da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4142';

const COLORS = ['#6B4C9A', '#8B6BB7', '#9B7BC4', '#B39DD4', '#CDB5E4'];

function App() {
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState(null);
  const [relatorioDiario, setRelatorioDiario] = useState([]);
  const [periodo, setPeriodo] = useState('30'); // 7, 30, 90 dias
  const [refreshing, setRefreshing] = useState(false);

  // Carregar dados
  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Resumo geral
      const resResumo = await axios.get(`${API_URL}/api/resumo`);
      setResumo(resResumo.data);
      
      // Relatório diário
      const resDiario = await axios.get(`${API_URL}/api/relatorio-diario?dias=${periodo}`);
      setRelatorioDiario(resDiario.data.data.reverse());
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setTimeout(() => setRefreshing(false), 500);
  };

  const exportarPDF = async () => {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.setTextColor(107, 76, 154);
    doc.text('LidIA - PAES', 14, 20);
    doc.setFontSize(14);
    doc.text('Relatório de Atendimentos', 14, 28);
    
    // Data
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 35);
    
    // Cards resumo
    if (resumo) {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('RESUMO GERAL', 14, 45);
      
      const resumoData = [
        ['Período', 'Interações', 'Pessoas', 'Qualificados'],
        [
          'Hoje',
          resumo.hoje?.total_interacoes || '0',
          resumo.hoje?.pessoas_atendidas || '0',
          resumo.hoje?.pessoas_qualificadas || '0'
        ],
        [
          'Semana',
          resumo.semana?.total_interacoes || '0',
          resumo.semana?.pessoas_atendidas || '0',
          resumo.semana?.pessoas_qualificadas || '0'
        ],
        [
          'Mês',
          resumo.mes?.total_interacoes || '0',
          resumo.mes?.pessoas_atendidas || '0',
          resumo.mes?.pessoas_qualificadas || '0'
        ]
      ];
      
      doc.autoTable({
        startY: 50,
        head: [resumoData[0]],
        body: resumoData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [107, 76, 154] }
      });
    }
    
    // Tabela diária
    if (relatorioDiario.length > 0) {
      const tableData = relatorioDiario.slice(0, 30).map(item => [
        format(new Date(item.data), 'dd/MM/yyyy'),
        item.total_interacoes,
        item.pessoas_atendidas,
        item.media_interacoes_por_pessoa,
        item.pessoas_qualificadas
      ]);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Data', 'Interações', 'Pessoas', 'Média/Pessoa', 'Qualificados']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [107, 76, 154] }
      });
    }
    
    doc.save(`relatorio-lidia-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportarExcel = async () => {
    const XLSX = await import('xlsx');
    
    // Preparar dados
    const dadosExcel = relatorioDiario.map(item => ({
      'Data': format(new Date(item.data), 'dd/MM/yyyy'),
      'Total Interações': item.total_interacoes,
      'Pessoas Atendidas': item.pessoas_atendidas,
      'Média Interações/Pessoa': item.media_interacoes_por_pessoa,
      'Novos Contatos': item.novos_contatos,
      'Pessoas Qualificadas': item.pessoas_qualificadas,
      'Ministérios Distintos': item.ministerios_distintos
    }));
    
    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dadosExcel);
    
    // Adicionar worksheet
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório Diário');
    
    // Salvar
    XLSX.writeFile(wb, `relatorio-lidia-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>LidIA - PAES</h1>
            <p>Dashboard de Atendimentos</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-icon" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={refreshing ? 'spinning' : ''} size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="filters">
        <div className="filter-group">
          <Calendar size={20} />
          <select 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)}
            className="filter-select"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>
        
        <div className="export-buttons">
          <button onClick={exportarPDF} className="btn-export">
            <Download size={18} />
            Exportar PDF
          </button>
          <button onClick={exportarExcel} className="btn-export">
            <Download size={18} />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="cards-container">
        <div className="card card-hoje">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <h3>Hoje</h3>
            <p className="card-value">{resumo?.hoje?.total_interacoes || 0}</p>
            <p className="card-label">interações</p>
            <div className="card-details">
              <span>{resumo?.hoje?.pessoas_atendidas || 0} pessoas</span>
              <span>{resumo?.hoje?.pessoas_qualificadas || 0} qualificados</span>
            </div>
          </div>
        </div>

        <div className="card card-semana">
          <div className="card-icon">
            <Users size={24} />
          </div>
          <div className="card-content">
            <h3>Esta Semana</h3>
            <p className="card-value">{resumo?.semana?.total_interacoes || 0}</p>
            <p className="card-label">interações</p>
            <div className="card-details">
              <span>{resumo?.semana?.pessoas_atendidas || 0} pessoas</span>
              <span>{resumo?.semana?.pessoas_qualificadas || 0} qualificados</span>
            </div>
          </div>
        </div>

        <div className="card card-mes">
          <div className="card-icon">
            <MessageSquare size={24} />
          </div>
          <div className="card-content">
            <h3>Este Mês</h3>
            <p className="card-value">{resumo?.mes?.total_interacoes || 0}</p>
            <p className="card-label">interações</p>
            <div className="card-details">
              <span>{resumo?.mes?.pessoas_atendidas || 0} pessoas</span>
              <span>Taxa: {resumo?.mes?.taxa_conversao_pct || 0}%</span>
            </div>
          </div>
        </div>

        <div className="card card-media">
          <div className="card-icon">
            <CheckCircle size={24} />
          </div>
          <div className="card-content">
            <h3>Média/Pessoa</h3>
            <p className="card-value">{resumo?.mes?.media_interacoes_por_pessoa || 0}x</p>
            <p className="card-label">interações por pessoa</p>
            <div className="card-details">
              <span>{resumo?.mes?.novos_contatos || 0} novos contatos</span>
              <span>{resumo?.mes?.ministerios_distintos || 0} ministérios</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-container">
        {/* Gráfico de Linha - Evolução Diária */}
        <div className="chart-card">
          <h3>Evolução de Interações</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={relatorioDiario}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0D9E8" />
              <XAxis 
                dataKey="data" 
                tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                stroke="#6B6B6B"
              />
              <YAxis stroke="#6B6B6B" />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E0D9E8',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total_interacoes" 
                stroke="#6B4C9A" 
                strokeWidth={3}
                name="Interações"
                dot={{ fill: '#6B4C9A', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="pessoas_atendidas" 
                stroke="#8B6BB7" 
                strokeWidth={3}
                name="Pessoas"
                dot={{ fill: '#8B6BB7', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Comparativo */}
        <div className="chart-card">
          <h3>Interações vs Pessoas vs Qualificados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={relatorioDiario.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0D9E8" />
              <XAxis 
                dataKey="data" 
                tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                stroke="#6B6B6B"
              />
              <YAxis stroke="#6B6B6B" />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E0D9E8',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="total_interacoes" fill="#6B4C9A" name="Interações" />
              <Bar dataKey="pessoas_atendidas" fill="#8B6BB7" name="Pessoas" />
              <Bar dataKey="pessoas_qualificadas" fill="#9B7BC4" name="Qualificados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="table-card">
        <h3>Detalhamento Diário</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Interações</th>
                <th>Pessoas</th>
                <th>Média/Pessoa</th>
                <th>Novos</th>
                <th>Qualificados</th>
                <th>Ministérios</th>
              </tr>
            </thead>
            <tbody>
              {relatorioDiario.map((item, index) => (
                <tr key={index}>
                  <td>{format(new Date(item.data), 'dd/MM/yyyy', { locale: ptBR })}</td>
                  <td className="number">{item.total_interacoes}</td>
                  <td className="number">{item.pessoas_atendidas}</td>
                  <td className="number">{item.media_interacoes_por_pessoa}x</td>
                  <td className="number badge badge-success">{item.novos_contatos}</td>
                  <td className="number badge badge-primary">{item.pessoas_qualificadas}</td>
                  <td className="number">{item.ministerios_distintos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>LidIA - PAES | Dashboard de Atendimentos</p>
        <p>Última atualização: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      </footer>
    </div>
  );
}

export default App;
