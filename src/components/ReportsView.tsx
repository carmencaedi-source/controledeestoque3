import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileJson,
  Layers,
  History,
  Calendar,
  Building,
  UserCheck,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { InventoryDatabase, ArticleWithHierarchy, StockMovement } from '../types/inventory';
import { cloudSyncService } from '../services/cloudSyncService';

interface ReportsViewProps {
  database: InventoryDatabase;
  articlesWithHierarchy: ArticleWithHierarchy[];
  initialSelectedArticleId?: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  database,
  articlesWithHierarchy,
  initialSelectedArticleId,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'position' | 'movements' | 'detailed'>('position');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(initialSelectedArticleId || null);
  const [movementFilterType, setMovementFilterType] = useState<'ALL' | 'ENTRADA' | 'SAIDA'>('ALL');

  const technicianName = database.technicianName;
  const emissionDate = new Date().toLocaleString('pt-BR');

  const totalValue = articlesWithHierarchy.reduce((acc, a) => acc + a.currentStock * a.unitCost, 0);
  const totalItems = articlesWithHierarchy.reduce((acc, a) => acc + a.currentStock, 0);

  // Ordena movimentações da mais recente para a mais antiga
  const filteredMovements = database.movements
    .filter((m) => {
      if (movementFilterType === 'ALL') return true;
      return m.type === movementFilterType;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Exportação CSV formatado em UTF-8 com BOM
  const handleExportCSV = () => {
    const headers = [
      'Código Hierárquico',
      'Nome do Artigo',
      'Tipo (Nível 1)',
      'Grupo (Nível 2)',
      'Subgrupo (Nível 3)',
      'Localização no Almoxarifado',
      'Saldo em Estoque',
      'Unidade',
      'Custo Unitário (R$)',
      'Valor Total (R$)',
      'Estoque Mínimo',
      'Situação',
      'Descrição Técnica',
      'Responsável Técnico',
    ];

    const rows = articlesWithHierarchy.map((art) => {
      const situation =
        art.currentStock === 0
          ? 'ZERADO'
          : art.currentStock <= art.minStock
          ? 'ALERTA MÍNIMO'
          : 'REGULAR';

      return [
        `"${art.code}"`,
        `"${art.name.replace(/"/g, '""')}"`,
        `"${art.type?.name || ''}"`,
        `"${art.group?.name || ''}"`,
        `"${art.subgroup?.name || ''}"`,
        `"${art.defaultLocation.replace(/"/g, '""')}"`,
        art.currentStock,
        `"${art.unit}"`,
        art.unitCost.toFixed(2),
        (art.currentStock * art.unitCost).toFixed(2),
        art.minStock,
        `"${situation}"`,
        `"${art.description.replace(/"/g, '""')}"`,
        `"${technicianName}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_posicao_estoque_senai_sp_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Barra Superior de Ações de Relatório */}
      <div className="bg-white border-2 border-neutral-300 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-[#E30613]" />
            <span>Relatório Oficial de Posição de Estoque e Rastreabilidade</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Demonstrativo contábil e físico consolidado para auditoria do SENAI SP
          </p>
        </div>

        {/* Botões Grandes de Exportação e Impressão */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
            title="Exportar para planilha eletrônica compatível com Excel"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV (Excel)</span>
          </button>

          <button
            onClick={() => cloudSyncService.downloadGoogleDriveBackupFile()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
            title="Exportar arquivo JSON para Google Drive"
          >
            <FileJson className="w-4 h-4 text-amber-400" />
            <span>Backup Google Drive (JSON)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#E30613] hover:bg-red-700 text-white rounded-lg text-xs font-black transition shadow-sm cursor-pointer border border-red-800"
            title="Imprimir ou salvar em PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Navegação entre as visualizações do relatório */}
      <div className="flex border-b-2 border-neutral-300 space-x-2 print:hidden">
        <button
          onClick={() => setActiveReportTab('position')}
          className={`py-2 px-4 text-xs font-bold uppercase transition rounded-t-lg border-t-2 border-x-2 ${
            activeReportTab === 'position'
              ? 'bg-white border-neutral-300 border-b-white text-[#E30613] -mb-[2px] z-10'
              : 'bg-neutral-100 border-transparent text-neutral-600 hover:text-black'
          }`}
        >
          1. Posição Consolidada dos Materiais ({articlesWithHierarchy.length})
        </button>
        <button
          onClick={() => setActiveReportTab('movements')}
          className={`py-2 px-4 text-xs font-bold uppercase transition rounded-t-lg border-t-2 border-x-2 ${
            activeReportTab === 'movements'
              ? 'bg-white border-neutral-300 border-b-white text-[#E30613] -mb-[2px] z-10'
              : 'bg-neutral-100 border-transparent text-neutral-600 hover:text-black'
          }`}
        >
          2. Histórico Geral de Movimentações ({database.movements.length})
        </button>
        <button
          onClick={() => setActiveReportTab('detailed')}
          className={`py-2 px-4 text-xs font-bold uppercase transition rounded-t-lg border-t-2 border-x-2 ${
            activeReportTab === 'detailed'
              ? 'bg-white border-neutral-300 border-b-white text-[#E30613] -mb-[2px] z-10'
              : 'bg-neutral-100 border-transparent text-neutral-600 hover:text-black'
          }`}
        >
          3. Ficha Analítica com Histórico por Item
        </button>
      </div>

      {/* ÁREA DE RELATÓRIO OFICIAL (Formatada tanto para tela quanto para impressão) */}
      <div className="bg-white border-2 border-neutral-300 rounded-xl p-6 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Cabeçalho do Relatório Padrão SENAI SP */}
        <div className="border-b-2 border-black pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="bg-[#E30613] text-white font-black px-3.5 py-1.5 text-lg rounded tracking-wider border border-red-800">
                SENAI SP
              </div>
              <div>
                <h1 className="text-base font-black text-black uppercase tracking-tight">
                  Serviço Nacional de Aprendizagem Industrial — São Paulo
                </h1>
                <p className="text-xs text-neutral-600">
                  SGEM &bull; Sistema de Gestão e Controle Físico-Financeiro de Almoxarifado
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div className="font-bold text-neutral-800">
                Data de Emissão: <span className="font-mono">{emissionDate}</span>
              </div>
              <div className="text-neutral-600">
                Responsável Técnico: <strong className="text-black">{technicianName}</strong>
              </div>
              <div className="text-[11px] text-neutral-500">
                Status: Validação de Estoque Concluída
              </div>
            </div>
          </div>

          {/* Cards de Métricas do Relatório */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-neutral-200 text-xs">
            <div className="bg-neutral-100 p-2.5 rounded border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Artigos no Catálogo</span>
              <strong className="text-lg font-black text-neutral-900">{articlesWithHierarchy.length} itens</strong>
            </div>

            <div className="bg-neutral-100 p-2.5 rounded border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Saldo Físico Geral</span>
              <strong className="text-lg font-black text-neutral-900">{totalItems.toLocaleString('pt-BR')} un/pc</strong>
            </div>

            <div className="bg-neutral-100 p-2.5 rounded border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Valor Total Avaliado</span>
              <strong className="text-lg font-black text-neutral-900">
                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </div>

            <div className="bg-neutral-100 p-2.5 rounded border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Total de Movimentações</span>
              <strong className="text-lg font-black text-neutral-900">{database.movements.length} registros</strong>
            </div>
          </div>
        </div>

        {/* TAB 1: Posição Consolidada dos Materiais */}
        {activeReportTab === 'position' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-neutral-800 tracking-wider">
              Posição Física e Financeira do Estoque Atual
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-2.5 border border-neutral-800">Código</th>
                    <th className="p-2.5 border border-neutral-800">Descrição do Material</th>
                    <th className="p-2.5 border border-neutral-800">Hierarquia (N1 / N2 / N3)</th>
                    <th className="p-2.5 border border-neutral-800">Localização</th>
                    <th className="p-2.5 border border-neutral-800 text-right">Saldo</th>
                    <th className="p-2.5 border border-neutral-800 text-right">Custo Médio</th>
                    <th className="p-2.5 border border-neutral-800 text-right">Valor Total</th>
                    <th className="p-2.5 border border-neutral-800 text-center">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {articlesWithHierarchy.map((art) => {
                    const isZero = art.currentStock === 0;
                    const isLow = art.currentStock <= art.minStock;
                    const itemTotal = art.currentStock * art.unitCost;

                    return (
                      <tr key={art.id} className="hover:bg-neutral-50">
                        <td className="p-2.5 font-mono font-bold text-neutral-900 border border-neutral-200 whitespace-nowrap bg-neutral-50/50">
                          {art.code}
                        </td>
                        <td className="p-2.5 border border-neutral-200">
                          <strong className="text-neutral-900 block">{art.name}</strong>
                          <span className="text-[11px] text-neutral-500 line-clamp-1">{art.description}</span>
                        </td>
                        <td className="p-2.5 text-[11px] text-neutral-600 border border-neutral-200 whitespace-nowrap">
                          <div>{art.type?.code} &bull; {art.type?.name.substring(0, 20)}...</div>
                          <div className="text-[10px] text-neutral-400">
                            {art.group?.name} &gt; {art.subgroup?.name}
                          </div>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-neutral-700 border border-neutral-200">
                          {art.defaultLocation}
                        </td>
                        <td className="p-2.5 font-bold text-right border border-neutral-200 whitespace-nowrap text-sm">
                          {art.currentStock} <span className="text-[10px] text-neutral-500">{art.unit}</span>
                        </td>
                        <td className="p-2.5 text-right font-mono border border-neutral-200 whitespace-nowrap">
                          {art.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold border border-neutral-200 whitespace-nowrap">
                          {itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-2.5 text-center border border-neutral-200 whitespace-nowrap">
                          {isZero ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800">
                              ZERADO
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#E30613] text-white">
                              BAIXO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              REGULAR
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100 font-black text-neutral-900 border-t-2 border-black">
                    <td colSpan={4} className="p-3 text-right uppercase">
                      Totais Gerais Consolidados:
                    </td>
                    <td className="p-3 text-right text-sm">
                      {totalItems.toLocaleString('pt-BR')} itens
                    </td>
                    <td className="p-3 text-right">—</td>
                    <td className="p-3 text-right text-sm text-[#E30613]">
                      {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Histórico Geral de Movimentações */}
        {activeReportTab === 'movements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-neutral-800 tracking-wider">
                Trilha de Auditoria e Movimentações de Estoque
              </h3>

              <div className="flex items-center space-x-2 text-xs print:hidden">
                <span className="font-bold text-neutral-600">Filtrar:</span>
                <button
                  onClick={() => setMovementFilterType('ALL')}
                  className={`px-2.5 py-1 rounded font-bold ${
                    movementFilterType === 'ALL' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  Todas ({database.movements.length})
                </button>
                <button
                  onClick={() => setMovementFilterType('ENTRADA')}
                  className={`px-2.5 py-1 rounded font-bold ${
                    movementFilterType === 'ENTRADA' ? 'bg-emerald-700 text-white' : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  Entradas
                </button>
                <button
                  onClick={() => setMovementFilterType('SAIDA')}
                  className={`px-2.5 py-1 rounded font-bold ${
                    movementFilterType === 'SAIDA' ? 'bg-[#E30613] text-white' : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  Saídas
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-2.5 border border-neutral-800">Data / Hora</th>
                    <th className="p-2.5 border border-neutral-800">Tipo</th>
                    <th className="p-2.5 border border-neutral-800">Código / Artigo</th>
                    <th className="p-2.5 border border-neutral-800">Documento / NF</th>
                    <th className="p-2.5 border border-neutral-800">Origem / Destino (Turma/Fornecedor)</th>
                    <th className="p-2.5 border border-neutral-800 text-right">Qtd</th>
                    <th className="p-2.5 border border-neutral-800 text-right">Anterior &gt; Novo</th>
                    <th className="p-2.5 border border-neutral-800">Localização</th>
                    <th className="p-2.5 border border-neutral-800">Técnico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredMovements.map((mov) => {
                    const article = database.articles.find((a) => a.id === mov.articleId);
                    const formattedDate = new Date(mov.timestamp).toLocaleString('pt-BR');

                    return (
                      <tr key={mov.id} className="hover:bg-neutral-50">
                        <td className="p-2.5 font-mono text-[11px] border border-neutral-200 whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="p-2.5 border border-neutral-200 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              mov.type === 'ENTRADA'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {mov.type}
                          </span>
                        </td>
                        <td className="p-2.5 border border-neutral-200">
                          <span className="font-mono font-bold text-neutral-900">{article?.code}</span>
                          <span className="block text-[11px] text-neutral-600 line-clamp-1">{article?.name}</span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] border border-neutral-200 whitespace-nowrap">
                          {mov.documentNumber}
                        </td>
                        <td className="p-2.5 border border-neutral-200">
                          <strong className="text-neutral-900 block">{mov.entityName}</strong>
                          <span className="text-[11px] text-neutral-500 italic">{mov.reason}</span>
                        </td>
                        <td className="p-2.5 text-right font-bold text-sm border border-neutral-200 whitespace-nowrap">
                          {mov.type === 'ENTRADA' ? '+' : '-'} {mov.quantity}
                        </td>
                        <td className="p-2.5 text-right font-mono text-[11px] border border-neutral-200 whitespace-nowrap">
                          {mov.previousStock} &rarr; <strong className="text-black">{mov.newStock}</strong>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-neutral-700 border border-neutral-200">
                          {mov.location}
                        </td>
                        <td className="p-2.5 text-neutral-900 font-semibold border border-neutral-200 whitespace-nowrap">
                          {mov.technicianName}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Ficha Analítica com Histórico Detalhado por Item */}
        {activeReportTab === 'detailed' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-neutral-800 tracking-wider">
              Ficha Analítica de Cada Item com Rastreabilidade Completa
            </h3>

            <div className="space-y-4">
              {articlesWithHierarchy.map((art) => {
                const isExpanded = expandedArticleId === art.id;
                const itemTotal = art.currentStock * art.unitCost;

                return (
                  <div
                    key={art.id}
                    className="border-2 border-neutral-300 rounded-xl overflow-hidden bg-white shadow-xs"
                  >
                    <div
                      onClick={() => setExpandedArticleId(isExpanded ? null : art.id)}
                      className="p-4 bg-neutral-50 hover:bg-neutral-100 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-[#E30613]"
                    >
                      <div className="flex items-center space-x-3">
                        <button className="text-neutral-500">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 rounded">
                              {art.code}
                            </span>
                            <h4 className="text-sm font-black text-neutral-900">{art.name}</h4>
                          </div>
                          <span className="text-xs text-neutral-500">
                            Local: <strong className="text-black font-mono">{art.defaultLocation}</strong> &bull; {art.type?.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs">
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-500 block uppercase">Saldo Atual</span>
                          <strong className="text-base text-neutral-900">
                            {art.currentStock} {art.unit}
                          </strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-500 block uppercase">Valor Contábil</span>
                          <strong className="text-base text-[#E30613]">
                            {itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </strong>
                        </div>
                        <span className="text-xs font-bold text-neutral-500 bg-neutral-200 px-2.5 py-1 rounded">
                          {art.recentMovements.length} Mov.
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-neutral-200 space-y-3 bg-white">
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs">
                          <p className="font-bold text-neutral-800 uppercase mb-1">Especificação Técnica Cadastrada:</p>
                          <p className="text-neutral-700 leading-relaxed">{art.description}</p>
                        </div>

                        <div>
                          <h5 className="text-xs font-black uppercase text-neutral-800 mb-2">
                            Histórico de Movimentações Registradas:
                          </h5>
                          {art.recentMovements.length === 0 ? (
                            <p className="text-xs text-neutral-400 italic">Nenhuma movimentação registrada para este item.</p>
                          ) : (
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-neutral-800 text-white font-bold uppercase text-[10px]">
                                  <th className="p-2">Data/Hora</th>
                                  <th className="p-2">Tipo</th>
                                  <th className="p-2">Documento</th>
                                  <th className="p-2">Fornecedor / Solicitante</th>
                                  <th className="p-2 text-right">Qtd</th>
                                  <th className="p-2 text-right">Saldo</th>
                                  <th className="p-2">Local</th>
                                  <th className="p-2">Resp. Técnico</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-200">
                                {art.recentMovements.map((m) => (
                                  <tr key={m.id} className="hover:bg-neutral-50">
                                    <td className="p-2 font-mono text-[11px] whitespace-nowrap">
                                      {new Date(m.timestamp).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="p-2">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                          m.type === 'ENTRADA'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {m.type}
                                      </span>
                                    </td>
                                    <td className="p-2 font-mono text-[11px]">{m.documentNumber}</td>
                                    <td className="p-2">
                                      <strong>{m.entityName}</strong> — <span className="text-neutral-500">{m.reason}</span>
                                    </td>
                                    <td className="p-2 text-right font-bold text-sm">
                                      {m.type === 'ENTRADA' ? '+' : '-'} {m.quantity}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold">{m.newStock} {art.unit}</td>
                                    <td className="p-2 font-mono text-[11px]">{m.location}</td>
                                    <td className="p-2 font-semibold">{m.technicianName}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bloco de Assinatura do Relatório Oficial para Impressão */}
        <div className="pt-8 border-t-2 border-neutral-300 mt-8 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
            <p className="font-bold text-black uppercase">{technicianName}</p>
            <p className="text-[11px] text-neutral-500">Responsável Técnico / Engenharia de Software</p>
          </div>
          <div>
            <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
            <p className="font-bold text-black uppercase">Gerência de Almoxarifado e Suprimentos</p>
            <p className="text-[11px] text-neutral-500">SENAI São Paulo — Departamento Regional</p>
          </div>
        </div>
      </div>
    </div>
  );
};
