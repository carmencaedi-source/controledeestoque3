import React from 'react';
import { UserCheck, Shield, BookOpen, ExternalLink, Edit2 } from 'lucide-react';

interface FooterProps {
  technicianName: string;
  onEditTechnician: () => void;
  onOpenDocs: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  technicianName,
  onEditTechnician,
  onOpenDocs,
}) => {
  return (
    <footer className="bg-black text-neutral-300 border-t-2 border-[#E30613] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Identificação Institucional */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#E30613] text-white font-extrabold px-3 py-1 rounded text-sm tracking-wider">
              SENAI SP
            </div>
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider">
                Serviço Nacional de Aprendizagem Industrial
              </p>
              <p className="text-[11px] text-neutral-400">
                Departamento Regional de São Paulo &bull; Almoxarifado Técnico
              </p>
            </div>
          </div>

          {/* Destaque do Responsável Técnico Exigido no Requisito */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex items-center justify-between shadow-inner">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-black rounded border border-neutral-700">
                <UserCheck className="w-4 h-4 text-[#E30613]" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Responsável Técnico
                </p>
                <p className="text-sm font-black text-white flex items-center space-x-1">
                  <span>{technicianName}</span>
                  <span className="text-[11px] font-normal text-neutral-400">(Engenharia de Software)</span>
                </p>
              </div>
            </div>

            <button
              onClick={onEditTechnician}
              className="text-xs bg-neutral-800 hover:bg-[#E30613] hover:text-white text-neutral-300 px-2.5 py-1.5 rounded transition flex items-center space-x-1 border border-neutral-700"
              title="Alterar nome do Responsável Técnico"
            >
              <Edit2 className="w-3 h-3" />
              <span>Editar</span>
            </button>
          </div>

          {/* Links e Normas */}
          <div className="flex flex-col md:items-end justify-center text-xs text-neutral-400 space-y-1">
            <div className="flex items-center space-x-3">
              <button
                onClick={onOpenDocs}
                className="hover:text-white underline decoration-red-600 flex items-center space-x-1 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#E30613]" />
                <span>Documentação & Persistência</span>
              </button>
              <span>&bull;</span>
              <span className="flex items-center space-x-1 text-neutral-400">
                <Shield className="w-3.5 h-3.5 text-neutral-500" />
                <span>Normas NR-10 / ISO 9001</span>
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Dados persistidos continuamente entre sessões via LocalStorage & GitHub / Google Drive.
            </p>
          </div>
        </div>

        {/* Linha Inferior com Copyright e Validação */}
        <div className="border-t border-neutral-800/80 mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
          <p>
            © {new Date().getFullYear()} SENAI São Paulo — SGEM Sistema de Gestão de Estoque de Materiais. Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E30613] animate-pulse"></span>
            <span>Ambiente Operacional Ativo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
