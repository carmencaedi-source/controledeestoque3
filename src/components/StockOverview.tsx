import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownToLine,
  ArrowUpFromLine,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  PlusCircle,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { InventoryDatabase, ArticleWithHierarchy } from '../types/inventory';

interface StockOverviewProps {
  database: InventoryDatabase;
  articlesWithHierarchy: ArticleWithHierarchy[];
  onOpenQuickEntry: (articleId: string) => void;
  onOpenQuickExit: (articleId: string) => void;
  onViewHistory: (articleId: string) => void;
  onNewArticle: () => void;
  onViewDetails: (article: ArticleWithHierarchy) => void;
}

export const StockOverview: React.FC<StockOverviewProps> = ({
  database,
  articlesWithHierarchy,
  onOpenQuickEntry,
  onOpenQuickExit,
  onViewHistory,
  onNewArticle,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'zero' | 'ok'>('all');
  const [sortField, setSortField] = useState<'code' | 'name' | 'stock' | 'value'>('code');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Grupos disponíveis de acordo com o Tipo selecionado
  const availableGroups = useMemo(() => {
    if (selectedTypeId === 'all') return database.groups;
    return database.groups.filter((g) => g.typeId === selectedTypeId);
  }, [database.groups, selectedTypeId]);

  // Filtro de artigos
  const filteredArticles = useMemo(() => {
    return articlesWithHierarchy
      .filter((art) => {
        // Busca textual
        const query = searchTerm.toLowerCase().trim();
        const matchesQuery =
          !query ||
          art.code.toLowerCase().includes(query) ||
          art.name.toLowerCase().includes(query) ||
          art.description.toLowerCase().includes(query) ||
          art.defaultLocation.toLowerCase().includes(query) ||
          art.type?.name.toLowerCase().includes(query) ||
          art.group?.name.toLowerCase().includes(query) ||
          art.subgroup?.name.toLowerCase().includes(query);

        if (!matchesQuery) return false;

        // Filtro por Tipo
        if (selectedTypeId !== 'all' && art.type?.id !== selectedTypeId) {
          return false;
        }

        // Filtro por Grupo
        if (selectedGroupId !== 'all' && art.group?.id !== selectedGroupId) {
          return false;
        }

        // Filtro por Situação de Estoque
        if (statusFilter === 'zero' && art.currentStock > 0) return false;
        if (statusFilter === 'low' && (art.currentStock > art.minStock || art.currentStock === 0)) return false;
        if (statusFilter === 'ok' && art.currentStock <= art.minStock) return false;

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'code') comp = a.code.localeCompare(b.code);
        else if (sortField === 'name') comp = a.name.localeCompare(b.name);
        else if (sortField === 'stock') comp = a.currentStock - b.currentStock;
        else if (sortField === 'value') comp = a.currentStock * a.unitCost - b.currentStock * b.unitCost;
        return sortAsc ? comp : -comp;
      });
  }, [articlesWithHierarchy, searchTerm, selectedTypeId, selectedGroupId, statusFilter, sortField, sortAsc]);

  const totalValue = filteredArticles.reduce((acc, a) => acc + a.currentStock * a.unitCost, 0);
  const totalPieces = filteredArticles.reduce((acc, a) => acc + a.currentStock, 0);

  return (
    <div className="space-y-5">
      {/* Barra de Filtros e Busca de Alto Contraste */}
      <div className="bg-white border-2 border-neutral-300 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Campo de Busca Rápida */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, nome do material, especificação técnica, localização ou responsável..."
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:border-[#E30613] transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-black font-bold"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Botão de Novo Artigo */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onNewArticle}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-[#E30613] hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow transition select-none cursor-pointer border border-red-800"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Novo Artigo no Catálogo
            </button>
          </div>
        </div>

        {/* Linha de Filtros Hierárquicos e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-neutral-200 text-xs">
          {/* Filtro por Tipo */}
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Filtrar por Tipo (Nível 1):</label>
            <select
              value={selectedTypeId}
              onChange={(e) => {
                setSelectedTypeId(e.target.value);
                setSelectedGroupId('all');
              }}
              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold focus:border-[#E30613] focus:outline-none"
            >
              <option value="all">Todos os Tipos ({database.types.length})</option>
              {database.types.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.code}] {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Grupo */}
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Filtrar por Grupo (Nível 2):</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              disabled={selectedTypeId !== 'all' && availableGroups.length === 0}
              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold focus:border-[#E30613] focus:outline-none disabled:opacity-50"
            >
              <option value="all">Todos os Grupos ({availableGroups.length})</option>
              {availableGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  [{g.code}] {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Situação de Estoque */}
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Situação do Estoque:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold focus:border-[#E30613] focus:outline-none"
            >
              <option value="all">Todas as Situações</option>
              <option value="ok">Estoque Normal (Acima do Mínimo)</option>
              <option value="low">⚠️ Alerta: Estoque Baixo ou Crítico</option>
              <option value="zero">🚫 Estoque Zerado (Saldo 0)</option>
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Ordenar Registros:</label>
            <div className="flex space-x-1">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-l-lg text-xs font-semibold focus:border-[#E30613] focus:outline-none"
              >
                <option value="code">Código Hierárquico</option>
                <option value="name">Nome do Artigo</option>
                <option value="stock">Quantidade em Estoque</option>
                <option value="value">Valor Total em Estoque</option>
              </select>
              <button
                onClick={() => setSortAsc(!sortAsc)}
                title={sortAsc ? 'Ordem Crescente' : 'Ordem Decrescente'}
                className="px-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-r-lg font-bold"
              >
                {sortAsc ? '▲' : '▼'}
              </button>
            </div>
          </div>
        </div>

        {/* Resumo da Consulta Atual */}
        <div className="flex flex-wrap items-center justify-between text-xs text-neutral-600 bg-neutral-100 p-2.5 rounded-lg border border-neutral-200">
          <div>
            Exibindo <strong className="text-black">{filteredArticles.length}</strong> de{' '}
            <strong className="text-black">{database.articles.length}</strong> materiais cadastrados
          </div>
          <div className="flex items-center space-x-4">
            <span>
              Saldo Filtrado: <strong className="text-black">{totalPieces.toLocaleString('pt-BR')} itens</strong>
            </span>
            <span>
              Valor Total:{' '}
              <strong className="text-black">
                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Lista / Tabela de Artigos com Posição de Estoque em Tempo Real */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-[#E30613] mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800 uppercase">Nenhum artigo encontrado</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
            {searchTerm || selectedTypeId !== 'all' || statusFilter !== 'all'
              ? 'Tente remover os filtros de busca para visualizar os demais materiais.'
              : 'O catálogo está vazio. Cadastre um novo artigo ou carregue os 10 materiais técnicos de teste.'}
          </p>
          <div className="mt-4 flex justify-center space-x-3">
            {(searchTerm || selectedTypeId !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTypeId('all');
                  setSelectedGroupId('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-lg"
              >
                Limpar Todos os Filtros
              </button>
            )}
            <button
              onClick={onNewArticle}
              className="px-4 py-2 bg-[#E30613] hover:bg-red-700 text-white text-xs font-bold rounded-lg"
            >
              + Cadastrar Primeiro Artigo
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((art) => {
            const isZero = art.currentStock === 0;
            const isLow = art.currentStock > 0 && art.currentStock <= art.minStock;
            const itemTotalValue = art.currentStock * art.unitCost;

            return (
              <div
                key={art.id}
                className="bg-white border-2 border-neutral-200 hover:border-black rounded-xl p-4 sm:p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Informações Principais & Hierarquia */}
                  <div className="flex-1 space-y-2">
                    {/* Migalhas Hierárquicas Tipo > Grupo > Subgrupo */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-neutral-500">
                      <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200 flex items-center">
                        <Layers className="w-3 h-3 text-[#E30613] mr-1" />
                        {art.type?.name || 'Tipo Não Definido'}
                      </span>
                      <ChevronRight className="w-3 h-3 text-neutral-400" />
                      <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200">
                        {art.group?.name || 'Grupo'}
                      </span>
                      <ChevronRight className="w-3 h-3 text-neutral-400" />
                      <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200">
                        {art.subgroup?.name || 'Subgrupo'}
                      </span>
                    </div>

                    {/* Código Hierárquico e Nome do Artigo */}
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 rounded">
                        {art.code}
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-neutral-900 hover:text-[#E30613] cursor-pointer" onClick={() => onViewDetails(art)}>
                        {art.name}
                      </h4>
                    </div>

                    {/* Descrição Detalhada com Nome do Responsável Técnico ao final */}
                    <p className="text-xs text-neutral-700 leading-relaxed bg-neutral-50 p-2.5 rounded border border-neutral-200 font-normal">
                      {art.description}
                    </p>

                    {/* Localização e Parâmetros */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 pt-1">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E30613]" />
                        <span className="font-semibold text-neutral-700">Localização:</span>
                        <strong className="text-black bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 font-mono">
                          {art.defaultLocation}
                        </strong>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="text-neutral-500">Estoque Mínimo:</span>
                        <strong className="text-neutral-900">{art.minStock} {art.unit}</strong>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="text-neutral-500">Custo Unitário Médio:</span>
                        <strong className="text-neutral-900">
                          {art.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {art.unit}
                        </strong>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="text-neutral-500">Valor Total:</span>
                        <strong className="text-neutral-900 font-bold">
                          {itemTotalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Posição Atual do Estoque & Ações Rápidas de Movimentação */}
                  <div className="lg:w-72 flex flex-col items-stretch lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-neutral-200 pt-3 lg:pt-0 lg:pl-5 space-y-3">
                    {/* Indicador de Saldo em Tempo Real */}
                    <div className="flex items-center justify-between lg:justify-end w-full space-x-3">
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-neutral-500 block uppercase">
                          Posição Atual
                        </span>
                        <div className="flex items-baseline space-x-1.5 justify-end">
                          <span
                            className={`text-2xl sm:text-3xl font-black ${
                              isZero
                                ? 'text-red-700'
                                : isLow
                                ? 'text-[#E30613]'
                                : 'text-neutral-900'
                            }`}
                          >
                            {art.currentStock}
                          </span>
                          <span className="text-xs font-bold text-neutral-600 uppercase">
                            {art.unit}
                          </span>
                        </div>
                      </div>

                      {/* Badge de Status */}
                      <div>
                        {isZero ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-black bg-red-100 text-red-800 border border-red-300">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            ZERADO
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-black bg-[#E30613] text-white">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                            ESTOQUE BAIXO
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            REGULAR
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botões Rápidos de Ação: Entrada / Saída / Histórico */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        onClick={() => onOpenQuickEntry(art.id)}
                        className="flex items-center justify-center space-x-1 py-2 px-3 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-sm border border-neutral-700"
                        title="Registrar recebimento/entrada deste artigo"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Entrada</span>
                      </button>

                      <button
                        onClick={() => onOpenQuickExit(art.id)}
                        disabled={art.currentStock === 0}
                        className="flex items-center justify-center space-x-1 py-2 px-3 bg-[#E30613] hover:bg-red-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition shadow-sm border border-red-800"
                        title={art.currentStock === 0 ? 'Saldo zerado para saída' : 'Registrar saída para oficina/aula'}
                      >
                        <ArrowUpFromLine className="w-3.5 h-3.5" />
                        <span>Saída</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between w-full text-xs">
                      <button
                        onClick={() => onViewDetails(art)}
                        className="text-neutral-600 hover:text-black flex items-center space-x-1 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ficha Técnica</span>
                      </button>

                      <button
                        onClick={() => onViewHistory(art.id)}
                        className="text-[#E30613] hover:text-red-800 flex items-center space-x-1 font-bold underline decoration-[#E30613]"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>{art.recentMovements.length} Movimentações</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
