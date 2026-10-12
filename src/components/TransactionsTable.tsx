import React, { useState } from 'react';
import { BankAccount, BankId, CategoryId, Transaction } from '../types';
import { formatBRL, formatDateBR } from '../utils/formatters';
import { CATEGORIES } from '../utils/categories';
import { Search, Trash2, Edit2, Download, Filter, Plus } from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onQuickChangeCategory: (txId: string, newCategoryId: CategoryId) => void;
  onOpenNewTransaction: () => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  accounts,
  onDeleteTransaction,
  onEditTransaction,
  onQuickChangeCategory,
  onOpenNewTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter transactions
  const filtered = transactions.filter(t => {
    if (selectedBank !== 'all' && t.bankId !== selectedBank) return false;
    if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
    if (selectedType !== 'all' && t.type !== selectedType) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(term);
      const matchSub = (t.subcategory || '').toLowerCase().includes(term);
      const matchAmount = t.amount.toString().includes(term);
      if (!matchDesc && !matchSub && !matchAmount) return false;
    }

    return true;
  });

  // Sort descending by date
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const totalFilteredIncome = sorted
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalFilteredExpense = sorted
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleExportCSV = () => {
    const headers = ['Data', 'Descricao', 'Banco', 'Tipo', 'Categoria', 'Subcategoria', 'Valor'];
    const rows = sorted.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.bankId,
      t.type === 'income' ? 'Entrada' : 'Despesa',
      t.categoryId,
      `"${(t.subcategory || '').replace(/"/g, '""')}"`,
      t.amount.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orcamento_familiar_extrato_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBankBadge = (bankId: BankId) => {
    if (bankId === 'nubank') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#820AD1]">
          <span className="w-2 h-2 rounded-full bg-[#820AD1]" />
          Nubank
        </span>
      );
    }
    if (bankId === 'neon') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#008A8A]">
          <span className="w-2 h-2 rounded-full bg-[#00D7D7]" />
          Banco Neon
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-neutral-600">
        <span className="w-2 h-2 rounded-full bg-neutral-400" />
        Dinheiro
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Extratos & Lançamentos
          </h1>
          <p className="text-xs text-neutral-500">
            Registro unificado de extratos do Nubank, Banco Neon e despesas manuais
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors cursor-pointer"
            title="Exportar para planilha Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Lançamento</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-white border border-neutral-200 rounded-md space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição, valor ou loja..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded focus:outline-hidden focus:border-neutral-500 bg-neutral-50"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Bank Filter */}
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="text-xs py-1.5 px-2 border border-neutral-300 rounded bg-white text-neutral-700 cursor-pointer"
            >
              <option value="all">Todos os Bancos</option>
              <option value="nubank">Nubank</option>
              <option value="neon">Banco Neon</option>
              <option value="dinheiro">Dinheiro</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs py-1.5 px-2 border border-neutral-300 rounded bg-white text-neutral-700 cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs py-1.5 px-2 border border-neutral-300 rounded bg-white text-neutral-700 cursor-pointer"
            >
              <option value="all">Todos os Tipos</option>
              <option value="expense">Despesas</option>
              <option value="income">Entradas (Ativos)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-xs text-neutral-600">
          <div>
            Mostrando <strong>{sorted.length}</strong> de {transactions.length} lançamentos
          </div>
          <div className="flex items-center gap-4 font-mono tabular-nums">
            <span>
              Entradas: <strong className="text-emerald-700">{formatBRL(totalFilteredIncome)}</strong>
            </span>
            <span>
              Despesas: <strong className="text-neutral-900">{formatBRL(totalFilteredExpense)}</strong>
            </span>
            <span>
              Líquido: <strong className={totalFilteredIncome - totalFilteredExpense >= 0 ? 'text-neutral-900' : 'text-rose-600'}>
                {formatBRL(totalFilteredIncome - totalFilteredExpense)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Nenhum lançamento encontrado para os filtros selecionados.
            <div className="mt-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBank('all');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}
                className="text-neutral-900 underline font-medium cursor-pointer"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-100 text-neutral-700 font-medium border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Descrição</th>
                  <th className="py-2.5 px-3">Banco</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Subcategoria</th>
                  <th className="py-2.5 px-3">Pagamento</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3 text-right w-20">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sorted.map(tx => {
                  const currentCat = CATEGORIES.find(c => c.id === tx.categoryId);

                  return (
                    <tr key={tx.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-neutral-600 whitespace-nowrap">
                        {formatDateBR(tx.date)}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-neutral-900">
                        {tx.description}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getBankBadge(tx.bankId)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {/* Quick category selector */}
                        <select
                          value={tx.categoryId}
                          onChange={(e) => onQuickChangeCategory(tx.id, e.target.value as CategoryId)}
                          className="text-xs py-0.5 px-1.5 border border-neutral-200 rounded bg-white text-neutral-800 cursor-pointer"
                        >
                          {CATEGORIES.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 whitespace-nowrap">
                        {tx.subcategory || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 uppercase text-[10px] whitespace-nowrap">
                        {tx.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-neutral-900'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'} {formatBRL(tx.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Editar lançamento"
                            className="p-1 text-neutral-400 hover:text-neutral-800 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Excluir lançamento"
                            className="p-1 text-neutral-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
