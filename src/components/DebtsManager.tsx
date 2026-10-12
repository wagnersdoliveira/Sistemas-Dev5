import React, { useState } from 'react';
import { BankAccount, Debt, CategoryId } from '../types';
import { formatBRL } from '../utils/formatters';
import { CATEGORIES } from '../utils/categories';
import { Plus, Check, Clock, Trash2, Edit2, CreditCard, Calendar, AlertTriangle } from 'lucide-react';

interface DebtsManagerProps {
  debts: Debt[];
  accounts: BankAccount[];
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onUpdateDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const DebtsManager: React.FC<DebtsManagerProps> = ({
  debts,
  accounts,
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt,
  onToggleStatus
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [creditor, setCreditor] = useState('');
  const [bankId, setBankId] = useState<'nubank' | 'neon' | 'dinheiro'>('nubank');
  const [totalAmount, setTotalAmount] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [installmentsTotal, setInstallmentsTotal] = useState('');
  const [installmentsPaid, setInstallmentsPaid] = useState('');
  const [dueDateDay, setDueDateDay] = useState('10');
  const [categoryId, setCategoryId] = useState<CategoryId>('outros_geral');
  const [notes, setNotes] = useState('');
  const [endDate, setEndDate] = useState('');
  const [debtType, setDebtType] = useState<'aluguel_caucao' | 'parcela_carro' | 'seguro_carro' | 'cartao' | 'outros'>('outros');

  const totalMonthlyPending = debts
    .filter(d => d.status === 'pendente')
    .reduce((acc, d) => acc + d.monthlyAmount, 0);

  const totalMonthlyPaid = debts
    .filter(d => d.status === 'pago')
    .reduce((acc, d) => acc + d.monthlyAmount, 0);

  const totalGlobalDebt = debts
    .reduce((acc, d) => acc + d.totalAmount, 0);

  // Filter debts specifically for Everton Donizete Ferreira
  const evertonDebts = debts.filter(d => 
    d.creditor.toLowerCase().includes('everton') || 
    d.title.toLowerCase().includes('everton')
  );

  const totalMonthlyEverton = evertonDebts.reduce((acc, d) => acc + d.monthlyAmount, 0);

  const handleOpenNew = () => {
    setEditingDebt(null);
    setTitle('');
    setCreditor('');
    setBankId('nubank');
    setTotalAmount('');
    setMonthlyAmount('');
    setInstallmentsTotal('');
    setInstallmentsPaid('');
    setDueDateDay('10');
    setCategoryId('outros_geral');
    setNotes('');
    setEndDate('');
    setDebtType('outros');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setTitle(debt.title);
    setCreditor(debt.creditor);
    setBankId(debt.bankId);
    setTotalAmount(debt.totalAmount.toString());
    setMonthlyAmount(debt.monthlyAmount.toString());
    setInstallmentsTotal(debt.installmentsTotal?.toString() || '');
    setInstallmentsPaid(debt.installmentsPaid?.toString() || '');
    setDueDateDay(debt.dueDateDay.toString());
    setCategoryId(debt.categoryId);
    setNotes(debt.notes || '');
    setEndDate(debt.endDate || '');
    setDebtType(debt.debtType || 'outros');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monthly = parseFloat(monthlyAmount.replace(',', '.')) || 0;
    const total = parseFloat(totalAmount.replace(',', '.')) || monthly;

    const data = {
      title: title.trim() || 'Dívida / Parcela',
      creditor: creditor.trim() || 'Geral',
      bankId,
      totalAmount: total,
      monthlyAmount: monthly,
      installmentsTotal: installmentsTotal ? parseInt(installmentsTotal, 10) : undefined,
      installmentsPaid: installmentsPaid ? parseInt(installmentsPaid, 10) : undefined,
      dueDateDay: parseInt(dueDateDay, 10) || 10,
      categoryId,
      status: 'pendente' as const,
      notes: notes.trim(),
      endDate: endDate.trim() || undefined,
      debtType
    };

    if (editingDebt) {
      onUpdateDebt({
        ...data,
        id: editingDebt.id,
        status: editingDebt.status
      });
    } else {
      onAddDebt(data);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Controle de Dívidas & Faturas Mensais
          </h1>
          <p className="text-xs text-neutral-500">
            Acompanhamento de aluguel caução, parcelas do carro, seguro, contas e faturas
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Dívida / Parcela</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-neutral-200 rounded-md">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Total a Pagar no Mês (Pendente)
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
            {formatBRL(totalMonthlyPending)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Compromissos a serem pagos no orçamento deste mês
          </div>
        </div>

        <div className="p-4 bg-white border border-neutral-200 rounded-md">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Já Quitado no Mês
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {formatBRL(totalMonthlyPaid)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Compromissos marcados como pagos
          </div>
        </div>

        <div className="p-4 bg-white border border-neutral-200 rounded-md">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Total Devedor Acumulado
          </div>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {formatBRL(totalGlobalDebt)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Soma de contratos restantes e saldos a vencer
          </div>
        </div>
      </div>

      {/* Destaque Exclusivo: Compromissos com Everton Donizete Ferreira */}
      <div className="bg-white border border-amber-300 rounded-md p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-neutral-200 gap-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <span>Compromissos Fixos: Everton Donizete Ferreira</span>
            </h2>
            <p className="text-xs text-neutral-600">
              Dívidas mensais obrigatórias: Aluguel caução (termina em abril de 2027), parcelas do carro e seguro
            </p>
          </div>
          <div className="text-xs font-mono bg-amber-50 border border-amber-200 px-3 py-1.5 rounded text-amber-900">
            Total mensal para Everton: <strong>{formatBRL(totalMonthlyEverton)}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {evertonDebts.map(debt => {
            const isPaid = debt.status === 'pago';
            return (
              <div 
                key={debt.id} 
                className={`p-3 border rounded ${
                  isPaid ? 'border-neutral-200 bg-neutral-50 opacity-75' : 'border-neutral-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-xs text-neutral-900 block">{debt.title}</span>
                    <span className="text-[11px] text-neutral-500">Credor: {debt.creditor}</span>
                  </div>
                  <button
                    onClick={() => onToggleStatus(debt.id)}
                    title={isPaid ? 'Marcar como pendente' : 'Marcar como pago'}
                    className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer border ${
                      isPaid 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'border-neutral-300 bg-white hover:border-neutral-500'
                    }`}
                  >
                    {isPaid && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-100 flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] text-neutral-400">Valor Mensal</div>
                    <div className={`text-base font-bold font-mono tabular-nums ${isPaid ? 'text-neutral-500' : 'text-amber-700'}`}>
                      {formatBRL(debt.monthlyAmount)}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-neutral-500">
                    <div>Vence dia {debt.dueDateDay}</div>
                    {debt.endDate && (
                      <div className="text-amber-800 font-semibold text-[10px]">
                        Término: {debt.endDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cartões Integrados: Fatura Nubank e Fatura Neon */}
      <div className="bg-white border border-neutral-200 rounded-md p-4">
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-neutral-100">
          <CreditCard className="w-4 h-4 text-neutral-700" />
          <h2 className="text-sm font-bold text-neutral-900">
            Faturas dos Cartões de Crédito (Nubank & Banco Neon)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.filter(a => a.id !== 'dinheiro').map(acc => (
            <div key={acc.id} className="border border-neutral-200 rounded p-3 bg-neutral-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-xs" 
                    style={{ backgroundColor: acc.bankBrandColor }}
                  />
                  <span className="font-bold text-sm text-neutral-900">Fatura {acc.name}</span>
                </div>
                <span className="text-xs text-neutral-500">
                  Limite: {formatBRL(acc.creditCardLimit)}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-neutral-500">Valor Atual da Fatura</div>
                  <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
                    {formatBRL(acc.creditCardBill)}
                  </div>
                </div>
                <div className="text-xs text-neutral-500 text-right">
                  Vencimento: Dia {acc.id === 'nubank' ? '10' : '20'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista Completa de Dívidas Cadastradas */}
      <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
        <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Todas as Dívidas & Parcelamentos do Orçamento ({debts.length})
          </h3>
          <span className="text-xs text-neutral-500">
            Marque a caixa para indicar que o pagamento foi realizado
          </span>
        </div>

        {debts.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Nenhuma dívida cadastrada. Clique no botão acima para adicionar.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {debts.map(debt => {
              const isPaid = debt.status === 'pago';

              return (
                <div 
                  key={debt.id} 
                  className={`p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors ${
                    isPaid ? 'opacity-70 bg-neutral-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleStatus(debt.id)}
                      title={isPaid ? 'Marcar como pendente' : 'Marcar como pago'}
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center cursor-pointer border transition-colors ${
                        isPaid 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-neutral-300 hover:border-neutral-500 bg-white'
                      }`}
                    >
                      {isPaid && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isPaid ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                          {debt.title}
                        </span>
                        <span className="text-xs text-neutral-400">· {debt.creditor}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-500">
                        <span>Vence todo dia {debt.dueDateDay}</span>
                        {debt.endDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-amber-800">Término: {debt.endDate}</span>
                          </>
                        )}
                        {debt.installmentsTotal && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Parcela {debt.installmentsPaid || 1} de {debt.installmentsTotal}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{debt.categoryId.replace('_', ' ')}</span>
                        {debt.notes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="italic">{debt.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-8 sm:pl-0">
                    <div className="text-right">
                      <div className="text-xs text-neutral-500">Valor Mensal</div>
                      <div className={`text-base font-bold font-mono tabular-nums ${isPaid ? 'text-neutral-500' : 'text-amber-700'}`}>
                        {formatBRL(debt.monthlyAmount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(debt)}
                        className="p-1 text-neutral-400 hover:text-neutral-800 cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDebt(debt.id)}
                        className="p-1 text-neutral-400 hover:text-rose-600 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição de Dívida */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-neutral-300 max-w-md w-full p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h3 className="text-sm font-bold text-neutral-900">
                {editingDebt ? 'Editar Dívida / Compromisso' : 'Nova Dívida / Parcela Mensal'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-800 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Título do Compromisso:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel Caução, Parcela do Carro, Seguro..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Credor / Beneficiário:</label>
                  <input
                    type="text"
                    placeholder="Ex: Everton Donizete Ferreira, Banco..."
                    value={creditor}
                    onChange={(e) => setCreditor(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Banco de Saída:</label>
                  <select
                    value={bankId}
                    onChange={(e) => setBankId(e.target.value as any)}
                    className="w-full p-2 border border-neutral-300 rounded bg-white"
                  >
                    <option value="nubank">Nubank</option>
                    <option value="neon">Banco Neon</option>
                    <option value="dinheiro">Outro / Geral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Valor da Parcela Mensal (R$):</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1100,00"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Valor Total / Contrato (R$):</label>
                  <input
                    type="text"
                    placeholder="Ex: 7700,00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Dia de Vencimento:</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDateDay}
                    onChange={(e) => setDueDateDay(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Término do Contrato (opcional):</label>
                  <input
                    type="text"
                    placeholder="Ex: Abril de 2027"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Parcela Atual:</label>
                  <input
                    type="number"
                    placeholder="Ex: 5"
                    value={installmentsPaid}
                    onChange={(e) => setInstallmentsPaid(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Total de Parcelas:</label>
                  <input
                    type="number"
                    placeholder="Ex: 12"
                    value={installmentsTotal}
                    onChange={(e) => setInstallmentsTotal(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Observações:</label>
                <input
                  type="text"
                  placeholder="Ex: Dívida obrigatória / aluguel caução"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 cursor-pointer"
                >
                  {editingDebt ? 'Salvar Alterações' : 'Cadastrar Dívida'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
