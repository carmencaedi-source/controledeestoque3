import React from 'react';
import {
  Package,
  MapPin,
  DollarSign,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  Edit2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ArticleWithHierarchy } from '../types/inventory';

interface ArticleDetailsModalProps {
  article: ArticleWithHierarchy | null;
  onClose: () => void;
  onEdit: (article: ArticleWithHierarchy) => void;
  onEntry: (articleId: string) => void;
  onExit: (articleId: string) => void;
}

export const ArticleDetailsModal: React.FC<ArticleDetailsModalProps> = ({
  article,
  onClose,
  onEdit,
  onEntry,
  onExit,
}) => {
  if (!article) return null;

  const isZero = article.currentStock === 0;
  const isLow = article.currentStock <= article.minStock && !isZero;
  const totalValue = article.currentStock * article.unitCost;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border-2 border-neutral-300 shadow-2xl overflow-hidden my-6">
        {/* Cabeçalho */}
        <div className="bg-black text-white p-5 border-b-4 border-[#E30613] flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-black bg-[#E30613] text-white px-2 py-0.5 rounded">
                {article.code}
              </span>
              <span className="text-xs text-neutral-400 font-bold uppercase">
                {article.type?.name}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">{article.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-black text-xl p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Breadcrumbs de Hierarquia */}
          <div className="bg-neutral-100 p-3 rounded-lg border border-neutral-200 flex flex-wrap items-center gap-2 text-[11px] font-bold text-neutral-700">
            <span className="text-[#E30613]">Tipo (N1): {article.type?.name} [{article.type?.code}]</span>
            <span>&gt;</span>
            <span>Grupo (N2): {article.group?.name} [{article.group?.code}]</span>
            <span>&gt;</span>
            <span>Subgrupo (N3): {article.subgroup?.name} [{article.subgroup?.code}]</span>
          </div>

          {/* Descrição com Assinatura Técnica de Verificação */}
          <div className="space-y-1">
            <h4 className="font-bold text-neutral-800 uppercase">Especificação e Descrição Técnica:</h4>
            <p className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-neutral-800 leading-relaxed font-normal">
              {article.description}
            </p>
          </div>

          {/* Cards de Saldo, Valor e Localização */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-neutral-100 p-3 rounded-lg border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Saldo Físico</span>
              <strong className="text-xl font-black text-neutral-900 block mt-0.5">
                {article.currentStock} {article.unit}
              </strong>
              <div className="mt-1">
                {isZero ? (
                  <span className="text-[10px] font-black text-red-700 bg-red-100 px-1.5 py-0.2 rounded">ZERADO</span>
                ) : isLow ? (
                  <span className="text-[10px] font-black text-white bg-[#E30613] px-1.5 py-0.2 rounded">BAIXO</span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">REGULAR</span>
                )}
              </div>
            </div>

            <div className="bg-neutral-100 p-3 rounded-lg border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Estoque Mínimo</span>
              <strong className="text-xl font-black text-neutral-900 block mt-0.5">
                {article.minStock} {article.unit}
              </strong>
              <span className="text-[10px] text-neutral-500 mt-1 block">Ponto de Reposição</span>
            </div>

            <div className="bg-neutral-100 p-3 rounded-lg border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Custo Médio Unitário</span>
              <strong className="text-base font-black text-neutral-900 block mt-1">
                {article.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
              <span className="text-[10px] text-neutral-500 mt-1 block">Por {article.unit}</span>
            </div>

            <div className="bg-neutral-100 p-3 rounded-lg border border-neutral-200">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Valor em Estoque</span>
              <strong className="text-base font-black text-[#E30613] block mt-1">
                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
              <span className="text-[10px] text-neutral-500 mt-1 block">Patrimônio Alocado</span>
            </div>
          </div>

          {/* Localização */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#E30613]" />
              <span className="font-bold text-neutral-800">Localização de Armazenamento:</span>
            </div>
            <strong className="font-mono text-neutral-900 bg-white px-2 py-1 rounded border border-neutral-300">
              {article.defaultLocation}
            </strong>
          </div>

          {/* Ações Rápidas */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-200">
            <button
              onClick={() => {
                onClose();
                onEdit(article);
              }}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer border border-neutral-300"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Artigo</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  onClose();
                  onEntry(article.id);
                }}
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Registrar Entrada</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onExit(article.id);
                }}
                disabled={article.currentStock === 0}
                className="px-4 py-2 bg-[#E30613] hover:bg-red-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
              >
                <ArrowUpFromLine className="w-3.5 h-3.5" />
                <span>- Registrar Saída</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
