import React, { useState, useEffect } from 'react';
import { Package, Hash, MapPin, DollarSign, AlertCircle, Layers } from 'lucide-react';
import { InventoryDatabase, Article, UnitOfMeasure } from '../types/inventory';
import { storageService } from '../services/storageService';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: InventoryDatabase;
  initialSubgroupId?: string;
  articleToEdit?: Article | null;
  onSuccess: (article: Article) => void;
}

const UNITS: UnitOfMeasure[] = ['UN', 'PC', 'KG', 'M', 'L', 'CX', 'JG', 'RL', 'PAR'];

export const ArticleModal: React.FC<ArticleModalProps> = ({
  isOpen,
  onClose,
  database,
  initialSubgroupId,
  articleToEdit,
  onSuccess,
}) => {
  const [subgroupId, setSubgroupId] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState<UnitOfMeasure>('UN');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [minStock, setMinStock] = useState('10');
  const [initialStock, setInitialStock] = useState('0');
  const [unitCost, setUnitCost] = useState('0.00');
  const [error, setError] = useState<string | null>(null);

  const technicianName = database.technicianName;

  useEffect(() => {
    if (articleToEdit) {
      setSubgroupId(articleToEdit.subgroupId);
      setName(articleToEdit.name);
      setDescription(articleToEdit.description);
      setUnit(articleToEdit.unit);
      setDefaultLocation(articleToEdit.defaultLocation);
      setMinStock(articleToEdit.minStock.toString());
      setInitialStock(articleToEdit.currentStock.toString());
      setUnitCost(articleToEdit.unitCost.toString());
    } else {
      if (initialSubgroupId) {
        setSubgroupId(initialSubgroupId);
      } else if (database.subgroups.length > 0) {
        setSubgroupId(database.subgroups[0].id);
      }
      setName('');
      setDescription('');
      setUnit('UN');
      setDefaultLocation('Almoxarifado Central - Prateleira A-01');
      setMinStock('10');
      setInitialStock('0');
      setUnitCost('0.00');
    }
    setError(null);
  }, [isOpen, articleToEdit, initialSubgroupId, database.subgroups]);

  if (!isOpen) return null;

  // Código automático previsto
  const previewCode = articleToEdit
    ? articleToEdit.code
    : subgroupId
    ? storageService.getNextArticleCode(subgroupId)
    : '01.01.01.0001';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subgroupId) {
      setError('Selecione o subgrupo hierárquico correspondente.');
      return;
    }

    if (!name.trim()) {
      setError('Informe o nome/título técnico do artigo.');
      return;
    }

    if (!description.trim()) {
      setError('Informe a descrição técnica detalhada do artigo.');
      return;
    }

    if (!defaultLocation.trim()) {
      setError('Informe a localização de armazenamento padrão.');
      return;
    }

    try {
      if (articleToEdit) {
        const updated = storageService.updateArticle(articleToEdit.id, {
          subgroupId,
          name: name.trim(),
          description: description.trim(),
          unit,
          defaultLocation: defaultLocation.trim(),
          minStock: parseFloat(minStock) || 0,
          unitCost: parseFloat(unitCost) || 0,
        });
        onSuccess(updated);
      } else {
        const created = storageService.addArticle({
          subgroupId,
          name: name.trim(),
          description: description.trim(),
          unit,
          defaultLocation: defaultLocation.trim(),
          minStock: parseFloat(minStock) || 0,
          currentStock: parseFloat(initialStock) || 0,
          unitCost: parseFloat(unitCost) || 0,
        });
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar artigo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border-2 border-neutral-300 shadow-2xl overflow-hidden my-8">
        <div className="bg-black text-white p-4 sm:p-5 border-b-4 border-[#E30613] flex items-center justify-between">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider flex items-center space-x-2">
              <Package className="w-5 h-5 text-[#E30613]" />
              <span>{articleToEdit ? 'Editar Artigo Técnico' : 'Cadastrar Novo Artigo no Catálogo'}</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cadastro hierárquico nível 4 com geração de código e rastreabilidade
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-black text-lg p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-500 text-red-900 rounded-lg flex items-center space-x-2 font-bold">
              <AlertCircle className="w-4 h-4 text-[#E30613] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Subgrupo e Código Automático */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block font-bold text-neutral-800 uppercase">
                Hierarquia / Subgrupo (Nível 3):
              </label>
              <select
                value={subgroupId}
                onChange={(e) => setSubgroupId(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold focus:border-[#E30613] focus:outline-none"
                required
              >
                {database.subgroups.map((sg) => {
                  const grp = database.groups.find((g) => g.id === sg.groupId);
                  const typ = grp ? database.types.find((t) => t.id === grp.typeId) : null;
                  return (
                    <option key={sg.id} value={sg.id}>
                      [{sg.code}] {sg.name} ({typ?.name.substring(0, 25)}...)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-neutral-800 uppercase">
                Código Automático:
              </label>
              <div className="p-2.5 bg-neutral-900 text-white font-mono font-black text-center rounded-lg border border-red-700">
                {previewCode}
              </div>
            </div>
          </div>

          {/* Nome do Artigo */}
          <div className="space-y-1">
            <label className="block font-bold text-neutral-800 uppercase">
              Nome do Artigo / Denominação Comercial:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fresa Metal Duro D12mm 4 Cortes Cobertura AlTiN"
              className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-bold focus:bg-white focus:outline-none focus:border-[#E30613]"
              required
            />
          </div>

          {/* Descrição Detalhada com Responsável Técnico */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-neutral-800 uppercase">
                Especificação Técnica Completa:
              </label>
              <span className="text-[11px] text-[#E30613] font-bold">
                * Conterá assinatura técnica de verificação ({technicianName})
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Dimensões, classes de tolerância, acabamento, normas técnicas e ao final: ${technicianName}.`}
              className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-[#E30613]"
              required
            />
          </div>

          {/* Unidade, Localização, Estoque Mínimo e Saldo Inicial */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-neutral-800 uppercase">
                Unidade:
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold focus:border-[#E30613] focus:outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-neutral-800 uppercase">
                Estoque Mínimo:
              </label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold focus:border-[#E30613] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-neutral-800 uppercase">
                {articleToEdit ? 'Saldo Atual:' : 'Saldo Inicial:'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!!articleToEdit}
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold focus:border-[#E30613] focus:outline-none disabled:bg-neutral-200"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-neutral-800 uppercase">
                Custo Unitário (R$):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold focus:border-[#E30613] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Localização Padrão */}
          <div className="space-y-1">
            <label className="block font-bold text-neutral-800 uppercase">
              Local de Armazenamento no Almoxarifado:
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                placeholder="Ex: Almoxarifado Central - Prateleira 02 - Gaveta 14"
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold focus:border-[#E30613] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E30613] hover:bg-red-700 text-white font-bold rounded-xl border border-red-800 shadow cursor-pointer"
            >
              {articleToEdit ? 'Salvar Alterações' : 'Concluir Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
