import React from 'react';
import {
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  Network,
  FileSpreadsheet,
  CloudCog,
} from 'lucide-react';

export type ActiveTab = 'overview' | 'movement_in' | 'movement_out' | 'hierarchy' | 'reports' | 'sync';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  articlesCount: number;
  movementsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  articlesCount,
  movementsCount,
}) => {
  const menuItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Posição do Estoque',
      sublabel: 'Consulta e saldos em tempo real',
      icon: Boxes,
      badge: `${articlesCount} itens`,
    },
    {
      id: 'movement_in' as ActiveTab,
      label: 'Registrar Entrada',
      sublabel: 'Recebimento de materiais e NF',
      icon: ArrowDownToLine,
      highlight: 'green',
    },
    {
      id: 'movement_out' as ActiveTab,
      label: 'Registrar Saída',
      sublabel: 'Requisição para oficinas e turmas',
      icon: ArrowUpFromLine,
      highlight: 'orange',
    },
    {
      id: 'hierarchy' as ActiveTab,
      label: 'Cadastro Hierárquico',
      sublabel: 'Tipo → Grupo → Subgrupo → Artigo',
      icon: Network,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Relatório Completo',
      sublabel: 'Histórico, auditoria e exportação',
      icon: FileSpreadsheet,
      badge: `${movementsCount} mov.`,
    },
    {
      id: 'sync' as ActiveTab,
      label: 'Persistência & Nuvem',
      sublabel: 'Google Drive & GitHub Sync',
      icon: CloudCog,
    },
  ];

  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
      {/* Grade de Botões Grandes, Bem Destacados e de Fácil Identificação */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl text-center transition-all duration-200 cursor-pointer border-2 select-none min-h-[105px] group ${
                isActive
                  ? 'bg-[#E30613] text-white border-red-700 shadow-lg shadow-red-950/30 scale-[1.02]'
                  : 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-300 hover:border-[#E30613] shadow-sm'
              }`}
            >
              {/* Badge opcional no topo do botão */}
              {item.badge && (
                <span
                  className={`absolute top-2 right-2 text-[10px] font-black px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-black/60 text-white border border-white/20'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Ícone Grande */}
              <div
                className={`p-2.5 rounded-lg mb-2 transition-transform duration-200 group-hover:scale-110 ${
                  isActive
                    ? 'bg-black/25 text-white'
                    : 'bg-neutral-100 text-[#E30613] group-hover:bg-red-50'
                }`}
              >
                <Icon className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Título Principal em Destaque */}
              <span
                className={`text-xs sm:text-sm font-extrabold uppercase tracking-tight leading-tight ${
                  isActive ? 'text-white' : 'text-neutral-900'
                }`}
              >
                {item.label}
              </span>

              {/* Sublegenda explicativa para rápida identificação */}
              <span
                className={`text-[10px] mt-1 font-medium line-clamp-1 ${
                  isActive ? 'text-red-100' : 'text-neutral-600'
                }`}
              >
                {item.sublabel}
              </span>

              {/* Marcador inferior ativo */}
              {isActive && (
                <span className="absolute bottom-1 w-8 h-1 bg-white rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
