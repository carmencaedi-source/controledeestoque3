import React, { useState, useEffect } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Building,
  MapPin,
  DollarSign,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';
import { InventoryDatabase, Article } from '../types/inventory';
import { storageService } from '../services/storageService';

interface MovementFormProps {
  initialType: 'ENTRADA' | 'SAIDA';
  selectedArticleId?: string;
  database: InventoryDatabase;
  onSuccess: (articleId: string) => void;
  onCancel: () => void;
}

export const MovementForm: React.FC<MovementFormProps> = ({
  initialType,
  selectedArticleId,
  database,
  onSuccess,
  onCancel,
}) => {
  const [movementType, setMovementType] = useState<'ENTRADA' | 'SAIDA'>(initialType);
  const [articleId, setArticleId] = useState<string>(selectedArticleId || '');
  const [quantity, setQuantity] = useState<string>('1');
  const [location, setLocation] = useState<string>('');
  const [unitCost, setUnitCost] = useState<string>('');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [entityName, setEntityName] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Artigo selecionado
  const currentArticle = database.articles.find((a) => a.id === articleId);

  useEffect(() => {
    if (selectedArticleId) {
      setArticleId(selectedArticleId);
    } else if (!articleId && database.articles.length > 0) {
      setArticleId(database.articles[0].id);
    }
  }, [selectedArticleId, database.articles]);

  // Atualiza a localização e sugestões quando o artigo muda
  useEffect(() => {
    if (currentArticle) {
      setLocation(currentArticle.defaultLocation);
      if (movementType === 'ENTRADA') {
        setUnitCost(currentArticle.unitCost.toString());
      }
    }
  }, [articleId, movementType]);

  // Cálculos de saldo em tempo real
  const qtyNumber = parseFloat(quantity) || 0;
  const previousStock = currentArticle ? currentArticle.currentStock : 0;
  const projectedStock =
    movementType === 'ENTRADA'
      ? previousStock + qtyNumber
      : previousStock - qtyNumber;

  const isInsufficientStock = movementType === 'SAIDA' && qtyNumber > previousStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentArticle) {
      setError('Por favor, selecione um artigo válido para a movimentação.');
      return;
    }

    if (qtyNumber <= 0) {
      setError('A quantidade deve ser um valor positivo maior que zero.');
      return;
    }

    if (movementType === 'SAIDA' && qtyNumber > currentArticle.currentStock) {
      setError(
        `Saldo insuficiente em estoque! Saldo disponível: ${currentArticle.currentStock} ${currentArticle.unit}. Quantidade requisitada: ${qtyNumber} ${currentArticle.unit}.`
      );
      return;
    }

    if (!documentNumber.trim()) {
      setError(
        movementType === 'ENTRADA'
          ? 'Informe o número da Nota Fiscal ou Guia de Recebimento.'
          : 'Informe o número da Requisição ou Ordem de Serviço.'
      );
      return;
    }

    if (!entityName.trim()) {
      setError(
        movementType === 'ENTRADA'
          ? 'Informe o fornecedor ou procedência do material.'
          : 'Informe a turma, oficina ou instrutor solicitante.'
      );
      return;
    }

    if (!reason.trim()) {
      setError('Informe a justificativa/motivo desta movimentação.');
      return;
    }

    try {
      setIsSubmitting(true);
      storageService.registerMovement({
        articleId: currentArticle.id,
        type: movementType,
        quantity: qtyNumber,
        location: location.trim() || currentArticle.defaultLocation,
        unitCost: unitCost ? parseFloat(unitCost) : undefined,
        documentNumber: documentNumber.trim(),
        entityName: entityName.trim(),
        reason: reason.trim(),
        notes: notes.trim(),
      });

      onSuccess(currentArticle.id);
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar movimentação.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border-2 border-neutral-300 rounded-2xl shadow-md overflow-hidden">
      {/* Cabeçalho do Formulário com seletor de tipo */}
      <div className="bg-black text-white p-5 border-b-4 border-[#E30613]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center space-x-2">
              {movementType === 'ENTRADA' ? (
                <>
                  <ArrowDownToLine className="w-6 h-6 text-emerald-400" />
                  <span>Registrar Entrada de Material</span>
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-6 h-6 text-[#E30613]" />
                  <span>Registrar Saída de Material (Baixa de Estoque)</span>
                </>
              )}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Movimentação oficial de almoxarifado do SENAI SP com rastreabilidade completa
            </p>
          </div>

          {/* Toggle Rápido Entrada / Saída */}
          <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-700">
            <button
              type="button"
              onClick={() => {
                setMovementType('ENTRADA');
                setError(null);
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-black transition ${
                movementType === 'ENTRADA'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>ENTRADA</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMovementType('SAIDA');
                setError(null);
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-black transition ${
                movementType === 'SAIDA'
                  ? 'bg-[#E30613] text-white shadow'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <ArrowUpFromLine className="w-4 h-4" />
              <span>SAÍDA</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border-2 border-[#E30613] text-red-900 rounded-xl flex items-start space-x-3 text-xs">
            <AlertCircle className="w-5 h-5 text-[#E30613] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sm">Atenção ao registrar movimentação:</strong>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* 1. Seleção do Artigo */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
            1. Selecione o Artigo / Material:
          </label>
          <select
            value={articleId}
            onChange={(e) => setArticleId(e.target.value)}
            className="w-full p-3 bg-neutral-50 border-2 border-neutral-300 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:border-[#E30613]"
          >
            {database.articles.map((art) => (
              <option key={art.id} value={art.id}>
                [{art.code}] {art.name} — Saldo Atual: {art.currentStock} {art.unit} ({art.defaultLocation})
              </option>
            ))}
          </select>
        </div>

        {/* Caixa de Resumo do Artigo Selecionado */}
        {currentArticle && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-xl p-4 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono font-black text-xs bg-black text-white px-2 py-0.5 rounded">
                Código: {currentArticle.code}
              </span>
              <span className="text-neutral-600">
                Localização atual:{' '}
                <strong className="text-black">{currentArticle.defaultLocation}</strong>
              </span>
            </div>
            <p className="text-neutral-700 italic">{currentArticle.description}</p>

            {/* Painel de Cálculo em Tempo Real do Saldo */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-300 text-center font-bold">
              <div className="bg-white p-2 rounded border border-neutral-200">
                <span className="text-[10px] text-neutral-500 uppercase block">Saldo Anterior</span>
                <span className="text-base text-neutral-800">
                  {previousStock} {currentArticle.unit}
                </span>
              </div>
              <div
                className={`p-2 rounded border ${
                  movementType === 'ENTRADA'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                <span className="text-[10px] uppercase block">
                  {movementType === 'ENTRADA' ? '+ Entrada Prevista' : '- Saída Prevista'}
                </span>
                <span className="text-base">
                  {movementType === 'ENTRADA' ? '+' : '-'} {qtyNumber || 0} {currentArticle.unit}
                </span>
              </div>
              <div
                className={`p-2 rounded border ${
                  isInsufficientStock
                    ? 'bg-red-100 border-red-400 text-red-900'
                    : 'bg-black text-white'
                }`}
              >
                <span className="text-[10px] uppercase block text-neutral-300">Novo Saldo Final</span>
                <span className="text-base">
                  {projectedStock} {currentArticle.unit}
                </span>
              </div>
            </div>

            {isInsufficientStock && (
              <div className="flex items-center space-x-1.5 text-red-700 font-bold text-xs pt-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Bloqueio: A quantidade requisitada excede o saldo físico existente!</span>
              </div>
            )}
          </div>
        )}

        {/* 2. Dados Quantitativos e Localização */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
              Quantidade ({currentArticle?.unit || 'UN'}):
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-sm font-bold focus:bg-white focus:outline-none focus:border-[#E30613]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
              Local de Armazenamento:
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Almoxarifado Central - Prateleira A-02"
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#E30613]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
              {movementType === 'ENTRADA' ? 'Custo Unitário (R$):' : 'Custo Unitário Médio (R$):'}
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                disabled={movementType === 'SAIDA'}
                placeholder="0.00"
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#E30613] disabled:bg-neutral-200"
              />
            </div>
          </div>
        </div>

        {/* 3. Documentação e Responsabilidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
              {movementType === 'ENTRADA' ? 'Nº da Nota Fiscal / Pedido:' : 'Nº da Requisição / O.S.:'}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder={
                  movementType === 'ENTRADA'
                    ? 'Ex: NF-e 045.892 Sandvik'
                    : 'Ex: REQ-AULA-2026/089'
                }
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#E30613]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
              {movementType === 'ENTRADA' ? 'Fornecedor / Procedência:' : 'Solicitante / Turma SENAI:'}
            </label>
            <div className="relative">
              {movementType === 'ENTRADA' ? (
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              ) : (
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              )}
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder={
                  movementType === 'ENTRADA'
                    ? 'Ex: Mitutoyo Sul Americana Ltda'
                    : 'Ex: Turma Mecânica de Usinagem 2026'
                }
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#E30613]"
                required
              />
            </div>
          </div>
        </div>

        {/* 4. Motivo e Justificativa */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
            Motivo / Finalidade da Movimentação:
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              movementType === 'ENTRADA'
                ? 'Ex: Reposição de insumos para aulas práticas do segundo semestre'
                : 'Ex: Execução de peças usinadas no projeto integrador da turma CNC-01'
            }
            className="w-full p-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#E30613]"
            required
          />
        </div>

        {/* 5. Observações Adicionais */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
            Observações Técnicas (Opcional):
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informações adicionais de lote, inspeção de qualidade ou condições de embalagem..."
            className="w-full p-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-lg text-xs font-normal focus:bg-white focus:outline-none focus:border-[#E30613]"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t-2 border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isInsufficientStock}
            className={`px-8 py-3 rounded-xl text-white font-black text-sm uppercase tracking-wide flex items-center justify-center space-x-2 transition shadow-md cursor-pointer border ${
              movementType === 'ENTRADA'
                ? 'bg-black hover:bg-neutral-800 border-neutral-900'
                : 'bg-[#E30613] hover:bg-red-700 border-red-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <PackageCheck className="w-5 h-5" />
            <span>
              {isSubmitting
                ? 'Registrando...'
                : movementType === 'ENTRADA'
                ? 'Confirmar Entrada de Estoque'
                : 'Confirmar Baixa de Estoque'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
