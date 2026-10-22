import React from 'react';
import { Package, ShieldCheck, Database, RefreshCw, UserCheck } from 'lucide-react';
import { InventoryDatabase } from '../types/inventory';

interface HeaderProps {
  database: InventoryDatabase;
  onOpenTechnicianModal: () => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  database,
  onOpenTechnicianModal,
  onRefresh,
}) => {
  const totalArticles = database.articles.length;
  const totalPieces = database.articles.reduce((acc, a) => acc + a.currentStock, 0);
  const totalValue = database.articles.reduce((acc, a) => acc + (a.currentStock * a.unitCost), 0);
  const lowStockCount = database.articles.filter((a) => a.currentStock <= a.minStock).length;

  return (
    <header className="bg-black text-white border-b-4 border-[#E30613] shadow-md">
      {/* Faixa Superior Institucional */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Título SENAI SP */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center bg-[#E30613] text-white px-3.5 py-2 font-black text-xl tracking-wider rounded shadow-sm border border-red-700 select-none">
              SENAI
              <span className="ml-1.5 text-xs font-bold uppercase tracking-widest bg-black px-1.5 py-0.5 rounded text-white">
                SP
              </span>
            </div>

            <div className="border-l-2 border-neutral-700 pl-3">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-white uppercase">
                  SGEM <span className="text-[#E30613] font-extrabold">•</span> Sistema de Gestão de Estoque de Materiais
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500 mr-1" />
                  Padrão Industrial
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Almoxarifado Geral &bull; Oficinas Técnicas de Aprendizagem Industrial
              </p>
            </div>
          </div>

          {/* Indicadores Rápidos & Responsável Técnico */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            <button
              onClick={onOpenTechnicianModal}
              title="Clique para alterar o Responsável Técnico"
              className="flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-red-600 px-3 py-1.5 rounded transition text-xs text-neutral-200"
            >
              <UserCheck className="w-4 h-4 text-[#E30613]" />
              <span className="font-semibold text-neutral-400">Resp. Técnico:</span>
              <span className="text-white font-bold underline decoration-[#E30613] underline-offset-4">
                {database.technicianName}
              </span>
            </button>

            <button
              onClick={onRefresh}
              title="Recarregar dados da sessão"
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Status Consolidado */}
      <div className="bg-neutral-900 border-t border-neutral-800 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between text-xs text-neutral-300 gap-y-2">
          <div className="flex items-center space-x-4 sm:space-x-6 flex-wrap">
            <div className="flex items-center space-x-1.5">
              <Package className="w-4 h-4 text-[#E30613]" />
              <span className="text-neutral-400">Artigos Cadastrados:</span>
              <strong className="text-white font-semibold text-sm">{totalArticles}</strong>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span className="text-neutral-400">Saldo Físico Total:</span>
              <strong className="text-white font-semibold text-sm">{totalPieces.toLocaleString('pt-BR')} itens</strong>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-neutral-400">Valor em Estoque:</span>
              <strong className="text-white font-semibold text-sm">
                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {lowStockCount > 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-[#E30613] text-white">
                ⚠️ {lowStockCount} {lowStockCount === 1 ? 'item em alerta mínimo' : 'itens em alerta mínimo'}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-emerald-400 bg-neutral-800 border border-neutral-700">
                ✓ Níveis de estoque regulares
              </span>
            )}

            <div className="flex items-center space-x-1 text-[11px] text-neutral-400">
              <Database className="w-3.5 h-3.5 text-neutral-400" />
              <span>Persistência Ativa (Sessão & Nuvem)</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
