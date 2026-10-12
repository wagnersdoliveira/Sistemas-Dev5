import React, { useState, useEffect } from 'react';
import { BankId, CategoryId, Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../utils/categories';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>, idToUpdate?: string) => void;
  transactionToEdit: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transactionToEdit
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankId, setBankId] = useState<BankId>('nubank');
  const [categoryId, setCategoryId] = useState<CategoryId>('alimentacao');
  const [subcategory, setSubcategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia' | 'dinheiro'>('pix');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setDescription(transactionToEdit.description);
      setAmount(transactionToEdit.amount.toString().replace('.', ','));
      setDate(transactionToEdit.date);
      setBankId(transactionToEdit.bankId);
      setCategoryId(transactionToEdit.categoryId);
      setSubcategory(transactionToEdit.subcategory || '');
      setPaymentMethod(transactionToEdit.paymentMethod);
      setNotes(transactionToEdit.notes || '');
    } else {
      setType('expense');
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setBankId('nubank');
      setCategoryId('alimentacao');
      setSubcategory('Padaria');
      setPaymentMethod('pix');
      setNotes('');
    }
  }, [transactionToEdit, isOpen]);

  // When category changes, suggest default subcategory
  const handleCategoryChange = (newCat: CategoryId) => {
    setCategoryId(newCat);
    const catDef = CATEGORIES.find(c => c.id === newCat);
    if (catDef && catDef.subcategories.length > 0) {
      setSubcategory(catDef.subcategories[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
    if (cleanAmount <= 0) return;

    onSave(
      {
        date,
        description: description.trim() || 'Lançamento',
        amount: cleanAmount,
        type,
        bankId,
        categoryId: type === 'income' ? 'renda' : categoryId,
        subcategory: type === 'income' ? 'Ativos Recebidos' : subcategory.trim(),
        paymentMethod,
        notes: notes.trim()
      },
      transactionToEdit ? transactionToEdit.id : undefined
    );
    onClose();
  };

  if (!isOpen) return null;

  const currentCatDef = CATEGORIES.find(c => c.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-neutral-300 max-w-md w-full p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <h3 className="text-sm font-bold text-neutral-900">
            {transactionToEdit ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
          </h3>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-800 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tipo: Entrada vs Despesa */}
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded border border-neutral-200">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              type === 'expense'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Despesa / Saída
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategoryId('renda');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              type === 'income'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Ativo Recebido / Entrada
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              {type === 'income' ? 'Descrição do Recebimento:' : 'Descrição da Despesa / Onde foi gasto:'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'income' ? 'Ex: Salário da Empresa, PIX Recebido...' : 'Ex: Padaria, Atacadão, Farmácia Drogasil, Posto...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-neutral-300 rounded focus:outline-hidden focus:border-neutral-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Valor (R$):</label>
              <input
                type="text"
                required
                placeholder="Ex: 45,90"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded font-mono font-bold text-sm"
              />
            </div>
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Data:</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Conta / Banco:</label>
              <select
                value={bankId}
                onChange={(e) => setBankId(e.target.value as BankId)}
                className="w-full p-2 border border-neutral-300 rounded bg-white text-neutral-800 cursor-pointer"
              >
                <option value="nubank">Nubank</option>
                <option value="neon">Banco Neon</option>
                <option value="dinheiro">Dinheiro (Carteira)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Forma de Pagamento:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2 border border-neutral-300 rounded bg-white text-neutral-800 cursor-pointer"
              >
                <option value="pix">PIX</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="transferencia">Transferência (TED)</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="dinheiro">Dinheiro Físico</option>
              </select>
            </div>
          </div>

          {type === 'expense' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Categoria de Gasto:</label>
                <select
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value as CategoryId)}
                  className="w-full p-2 border border-neutral-300 rounded bg-white text-neutral-800 cursor-pointer"
                >
                  {CATEGORIES.filter(c => c.id !== 'renda').map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Subcategoria:</label>
                {currentCatDef && currentCatDef.subcategories.length > 0 ? (
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded bg-white text-neutral-800 cursor-pointer"
                  >
                    {currentCatDef.subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Ex: Geral"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded"
                  />
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Observações (opcional):</label>
            <input
              type="text"
              placeholder="Ex: Lanche das crianças após o culto..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-neutral-300 rounded"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 cursor-pointer"
            >
              {transactionToEdit ? 'Atualizar Lançamento' : 'Salvar no Orçamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
