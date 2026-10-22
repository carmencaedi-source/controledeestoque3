import React, { useState } from 'react';
import {
  Layers,
  FolderPlus,
  Plus,
  ChevronDown,
  ChevronRight,
  Package,
  Hash,
  Info,
  CheckCircle2,
  FolderTree,
} from 'lucide-react';
import { InventoryDatabase, ItemType, ItemGroup, ItemSubgroup } from '../types/inventory';
import { storageService } from '../services/storageService';

interface HierarchyManagerProps {
  database: InventoryDatabase;
  onSelectArticle: (articleId: string) => void;
  onNewArticleUnderSubgroup: (subgroupId: string) => void;
}

export const HierarchyManager: React.FC<HierarchyManagerProps> = ({
  database,
  onSelectArticle,
  onNewArticleUnderSubgroup,
}) => {
  // Estados de expansão da árvore
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({
    'type-01': true,
    'type-02': true,
    'type-03': true,
    'type-04': true,
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'group-01-01': true,
    'group-01-02': true,
    'group-02-01': true,
    'group-03-01': true,
  });

  // Modais de criação rápida em cascata
  const [modalType, setModalType] = useState<'type' | 'group' | 'subgroup' | null>(null);
  const [targetTypeId, setTargetTypeId] = useState<string>('');
  const [targetGroupId, setTargetGroupId] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const toggleType = (typeId: string) => {
    setExpandedTypes((prev) => ({ ...prev, [typeId]: !prev[typeId] }));
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleOpenNewGroup = (typeId: string) => {
    setTargetTypeId(typeId);
    setNewName('');
    setNewDescription('');
    setModalType('group');
  };

  const handleOpenNewSubgroup = (groupId: string) => {
    setTargetGroupId(groupId);
    setNewName('');
    setNewDescription('');
    setModalType('subgroup');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (modalType === 'type') {
      const created = storageService.addType({
        name: newName,
        description: newDescription,
      });
      setFeedbackMsg(`Tipo criado com sucesso com código automático [${created.code}]!`);
    } else if (modalType === 'group') {
      const created = storageService.addGroup({
        typeId: targetTypeId,
        name: newName,
        description: newDescription,
      });
      setExpandedTypes((prev) => ({ ...prev, [targetTypeId]: true }));
      setFeedbackMsg(`Grupo criado com sucesso com código automático [${created.code}]!`);
    } else if (modalType === 'subgroup') {
      const created = storageService.addSubgroup({
        groupId: targetGroupId,
        name: newName,
        description: newDescription,
      });
      setExpandedGroups((prev) => ({ ...prev, [targetGroupId]: true }));
      setFeedbackMsg(`Subgrupo criado com sucesso com código automático [${created.code}]!`);
    }

    setModalType(null);
    setNewName('');
    setNewDescription('');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Informações da Estrutura Hierárquica SENAI SP */}
      <div className="bg-white border-2 border-neutral-300 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FolderTree className="w-5 h-5 text-[#E30613]" />
              <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">
                Estrutura Hierárquica de Materiais: Tipo → Grupo → Subgrupo → Artigo
              </h2>
            </div>
            <p className="text-xs text-neutral-600 mt-1">
              Padrão cadastral do SENAI SP. A codificação é sequencial e gerada automaticamente em cada nível hierárquico.
            </p>
          </div>

          <button
            onClick={() => {
              setModalType('type');
              setNewName('');
              setNewDescription('');
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition border border-neutral-700 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-[#E30613]" />
            <span>+ Novo Tipo Raiz (Nível 1)</span>
          </button>
        </div>

        {/* Resumo da Codificação Automática */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-neutral-200 text-xs">
          <div className="bg-neutral-100 p-2.5 rounded-lg border border-neutral-200">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Nível 1 • Tipo</span>
            <strong className="text-neutral-900 font-mono text-sm block">01, 02, 03...</strong>
            <span className="text-[11px] text-neutral-600">Área técnica (ex: Usinagem)</span>
          </div>

          <div className="bg-neutral-100 p-2.5 rounded-lg border border-neutral-200">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Nível 2 • Grupo</span>
            <strong className="text-neutral-900 font-mono text-sm block">01.01, 01.02...</strong>
            <span className="text-[11px] text-neutral-600">Família funcional (ex: Corte)</span>
          </div>

          <div className="bg-neutral-100 p-2.5 rounded-lg border border-neutral-200">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Nível 3 • Subgrupo</span>
            <strong className="text-neutral-900 font-mono text-sm block">01.01.01...</strong>
            <span className="text-[11px] text-neutral-600">Classe (ex: Pastilhas)</span>
          </div>

          <div className="bg-black text-white p-2.5 rounded-lg border border-red-700">
            <span className="text-[10px] uppercase font-bold text-red-400 block">Nível 4 • Artigo</span>
            <strong className="text-white font-mono text-sm block">01.01.01.0001</strong>
            <span className="text-[11px] text-neutral-300">Código Único Automático</span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border-2 border-emerald-500 text-emerald-900 rounded-xl flex items-center space-x-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Árvore Navegável Interativa */}
      <div className="bg-white border-2 border-neutral-300 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-neutral-900 text-white px-5 py-3 border-b-2 border-[#E30613] flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider">
            Navegador em Árvore do Catálogo Técnico
          </span>
          <span className="text-xs text-neutral-400">
            {database.types.length} Tipos &bull; {database.groups.length} Grupos &bull; {database.subgroups.length} Subgrupos &bull; {database.articles.length} Artigos
          </span>
        </div>

        {database.types.length === 0 ? (
          <div className="p-10 text-center text-neutral-500 text-xs">
            Nenhuma hierarquia cadastrada. Clique no botão acima para adicionar o primeiro Tipo de material.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {database.types.map((type) => {
              const isTypeExpanded = !!expandedTypes[type.id];
              const groupsOfType = database.groups.filter((g) => g.typeId === type.id);
              const articlesInType = database.articles.filter((a) => {
                const sub = database.subgroups.find((s) => s.id === a.subgroupId);
                const grp = sub ? database.groups.find((g) => g.id === sub.groupId) : null;
                return grp?.typeId === type.id;
              });

              return (
                <div key={type.id} className="bg-neutral-50/50">
                  {/* Linha do Tipo (Nível 1) */}
                  <div className="flex items-center justify-between p-3.5 hover:bg-neutral-100 transition border-l-4 border-[#E30613]">
                    <div
                      onClick={() => toggleType(type.id)}
                      className="flex items-center space-x-2.5 cursor-pointer flex-1"
                    >
                      <button className="text-neutral-500 hover:text-black">
                        {isTypeExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 rounded">
                        {type.code}
                      </span>
                      <strong className="text-sm font-black text-neutral-900">
                        {type.name}
                      </strong>
                      <span className="text-xs text-neutral-500 hidden sm:inline">
                        — {type.description}
                      </span>
                      <span className="text-[11px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded font-bold">
                        {articlesInType.length} artigos
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenNewGroup(type.id)}
                      className="text-xs text-neutral-700 hover:text-white bg-white hover:bg-neutral-800 border border-neutral-300 hover:border-black px-2.5 py-1 rounded font-bold transition flex items-center space-x-1"
                      title="Adicionar novo grupo sob este tipo"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#E30613]" />
                      <span>+ Grupo</span>
                    </button>
                  </div>

                  {/* Filhos: Grupos (Nível 2) */}
                  {isTypeExpanded && (
                    <div className="pl-6 sm:pl-10 pr-3 pb-3 pt-1 space-y-2 bg-white">
                      {groupsOfType.length === 0 ? (
                        <div className="text-xs text-neutral-400 italic py-2 pl-4">
                          Nenhum grupo cadastrado neste tipo.
                        </div>
                      ) : (
                        groupsOfType.map((group) => {
                          const isGroupExpanded = !!expandedGroups[group.id];
                          const subgroupsOfGroup = database.subgroups.filter(
                            (sg) => sg.groupId === group.id
                          );
                          const articlesInGroup = database.articles.filter((a) => {
                            const sub = database.subgroups.find((s) => s.id === a.subgroupId);
                            return sub?.groupId === group.id;
                          });

                          return (
                            <div
                              key={group.id}
                              className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50"
                            >
                              {/* Linha do Grupo */}
                              <div className="flex items-center justify-between p-2.5 hover:bg-neutral-100 transition border-l-4 border-black">
                                <div
                                  onClick={() => toggleGroup(group.id)}
                                  className="flex items-center space-x-2 cursor-pointer flex-1"
                                >
                                  <button className="text-neutral-500 hover:text-black">
                                    {isGroupExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <span className="font-mono text-xs font-bold bg-neutral-800 text-white px-1.5 py-0.5 rounded">
                                    {group.code}
                                  </span>
                                  <strong className="text-xs sm:text-sm font-bold text-neutral-900">
                                    {group.name}
                                  </strong>
                                  <span className="text-xs text-neutral-500 hidden md:inline">
                                    — {group.description}
                                  </span>
                                  <span className="text-[10px] bg-neutral-200 text-neutral-700 px-1.5 py-0.2 rounded font-semibold">
                                    {articlesInGroup.length}
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleOpenNewSubgroup(group.id)}
                                  className="text-[11px] text-neutral-700 hover:text-white bg-white hover:bg-neutral-800 border border-neutral-300 hover:border-black px-2 py-0.5 rounded font-bold transition flex items-center space-x-1"
                                  title="Adicionar novo subgrupo sob este grupo"
                                >
                                  <Plus className="w-3 h-3 text-[#E30613]" />
                                  <span>+ Subgrupo</span>
                                </button>
                              </div>

                              {/* Filhos: Subgrupos (Nível 3) */}
                              {isGroupExpanded && (
                                <div className="pl-4 sm:pl-8 pr-2 py-2 space-y-2 bg-white border-t border-neutral-200">
                                  {subgroupsOfGroup.length === 0 ? (
                                    <div className="text-xs text-neutral-400 italic py-1">
                                      Nenhum subgrupo cadastrado neste grupo.
                                    </div>
                                  ) : (
                                    subgroupsOfGroup.map((subgroup) => {
                                      const articlesInSub = database.articles.filter(
                                        (a) => a.subgroupId === subgroup.id
                                      );

                                      return (
                                        <div
                                          key={subgroup.id}
                                          className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-md space-y-2"
                                        >
                                          {/* Linha do Subgrupo */}
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <span className="font-mono text-[11px] font-bold bg-[#E30613] text-white px-1.5 py-0.5 rounded">
                                                {subgroup.code}
                                              </span>
                                              <strong className="text-xs font-bold text-neutral-900">
                                                {subgroup.name}
                                              </strong>
                                              <span className="text-[11px] text-neutral-500 hidden sm:inline">
                                                — {subgroup.description}
                                              </span>
                                            </div>

                                            <button
                                              onClick={() => onNewArticleUnderSubgroup(subgroup.id)}
                                              className="text-[11px] bg-black hover:bg-[#E30613] text-white px-2.5 py-1 rounded font-bold transition flex items-center space-x-1"
                                            >
                                              <Plus className="w-3 h-3" />
                                              <span>+ Novo Artigo</span>
                                            </button>
                                          </div>

                                          {/* Lista de Artigos no Subgrupo (Nível 4) */}
                                          {articlesInSub.length > 0 && (
                                            <div className="pl-2 pt-1 border-t border-neutral-200/80 divide-y divide-neutral-200 text-xs">
                                              {articlesInSub.map((art) => (
                                                <div
                                                  key={art.id}
                                                  onClick={() => onSelectArticle(art.id)}
                                                  className="py-1.5 flex items-center justify-between hover:bg-neutral-100 px-2 rounded cursor-pointer transition"
                                                >
                                                  <div className="flex items-center space-x-2">
                                                    <Package className="w-3.5 h-3.5 text-[#E30613]" />
                                                    <span className="font-mono font-bold text-[11px] text-neutral-700">
                                                      {art.code}
                                                    </span>
                                                    <span className="font-semibold text-neutral-900">
                                                      {art.name}
                                                    </span>
                                                  </div>

                                                  <div className="flex items-center space-x-3 text-[11px]">
                                                    <span className="text-neutral-500 font-mono">
                                                      {art.defaultLocation}
                                                    </span>
                                                    <span className="font-black bg-neutral-200 text-black px-2 py-0.5 rounded">
                                                      {art.currentStock} {art.unit}
                                                    </span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criação de Tipo, Grupo ou Subgrupo */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-neutral-300 shadow-2xl overflow-hidden">
            <div className="bg-black text-white p-4 border-b-4 border-[#E30613] flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center space-x-2">
                <FolderPlus className="w-4 h-4 text-[#E30613]" />
                <span>
                  {modalType === 'type' && 'Cadastrar Novo Tipo de Material (Nível 1)'}
                  {modalType === 'group' && 'Cadastrar Novo Grupo (Nível 2)'}
                  {modalType === 'subgroup' && 'Cadastrar Novo Subgrupo (Nível 3)'}
                </span>
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-neutral-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Código Gerado Automaticamente:
                </label>
                <div className="p-2.5 bg-neutral-100 rounded border border-neutral-300 font-mono font-bold text-black flex items-center justify-between">
                  <span>
                    {modalType === 'type' && storageService.getNextTypeCode()}
                    {modalType === 'group' && storageService.getNextGroupCode(targetTypeId)}
                    {modalType === 'subgroup' && storageService.getNextSubgroupCode(targetGroupId)}
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase font-sans">
                    Sequência Automática Garantida
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Nome da Categoria:
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Materiais de Usinagem, Ferramentas de Corte, etc."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-[#E30613]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 uppercase mb-1">
                  Descrição / Finalidade Técnica:
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descreva as aplicações e tipos de itens contidos nesta classificação..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:border-[#E30613]"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E30613] hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer border border-red-800"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
