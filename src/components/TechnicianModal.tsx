import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Check } from 'lucide-react';
import { storageService } from '../services/storageService';

interface TechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onUpdated: (newName: string) => void;
}

export const TechnicianModal: React.FC<TechnicianModalProps> = ({
  isOpen,
  onClose,
  currentName,
  onUpdated,
}) => {
  const [name, setName] = useState(currentName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    storageService.setTechnicianName(cleanName);
    onUpdated(cleanName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border-2 border-neutral-300 shadow-2xl overflow-hidden">
        <div className="bg-black text-white p-4 border-b-4 border-[#E30613] flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-[#E30613]" />
            <span>Responsável Técnico do Sistema</span>
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <p className="text-neutral-600 leading-relaxed">
            Conforme especificação do projeto, o rodapé e os relatórios oficiais registram o primeiro nome do profissional que executa ou administra o sistema, podendo ser substituído a qualquer momento pelo usuário.
          </p>

          <div>
            <label className="block font-bold text-neutral-800 uppercase mb-1">
              Primeiro Nome do Responsável Técnico:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Carmen, Alexandre, etc."
              className="w-full p-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-sm font-bold focus:bg-white focus:outline-none focus:border-[#E30613]"
              required
            />
          </div>

          <div className="bg-neutral-100 p-3 rounded-lg border border-neutral-200 text-neutral-700 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px]">
              O nome atualizado será vinculado automaticamente a todas as novas movimentações e relatórios de auditoria.
            </span>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E30613] hover:bg-red-700 text-white font-bold rounded-lg flex items-center space-x-1 border border-red-800 shadow cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Responsável</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
