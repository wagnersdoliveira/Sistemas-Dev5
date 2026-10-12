import React from 'react';
import { BankAccount, Debt, Transaction } from '../types';
import { formatBRL, getMonthName } from '../utils/formatters';
import { CATEGORIES } from '../utils/categories';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Utensils,
  Fuel,
  Wrench,
  HeartPulse,
  Church,
  Tag
} from 'lucide-react';

interface MonthlyOverviewProps {
  currentDate: Date;
  onChangeMonth: (delta: number) => void;
  transactions: Transaction[];
  accounts: BankAccount[];
  debts: Debt[];
  onSyncBank: (bankId: 'nubank' | 'neon') => void;
  syncingBank: string | null;
  onGoToTab: (tab: string) => void;
}

export const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({
  currentDate,
  onChangeMonth,
  transactions,
  accounts,
  debts,
  onSyncBank,
  syncingBank,
  onGoToTab
}) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Filter transactions for this month
  const monthTransactions = transactions.filter(t => {
    const [y, m] = t.date.split('-').map(Number);
    return y === currentYear && m === currentMonth + 1;
  });

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Monthly debt commitment (pending debts for this month)
  const totalDebtsMonthly = debts
    .filter(d => d.status === 'pendente')
    .reduce((acc, d) => acc + d.monthlyAmount, 0);

  // Net Balance = Income - Expenses
  const netBalance = totalIncome - totalExpenses;
  // Final projected remaining after paying scheduled debts
  const projectedRemaining = totalIncome - totalExpenses - totalDebtsMonthly;

  // Breakdown by categories for this month
  const categoryTotals = CATEGORIES.map(cat => {
    const total = monthTransactions
      .filter(t => t.type === 'expense' && t.categoryId === cat.id)
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      ...cat,
      total,
      percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
    };
  }).filter(c => c.id !== 'renda');

  // Subcategories breakdown for key categories requested by user
  const alimentacaoTx = monthTransactions.filter(t => t.categoryId === 'alimentacao');
  const padariaTotal = alimentacaoTx.filter(t => t.subcategory?.toLowerCase().includes('padaria')).reduce((a, t) => a + t.amount, 0);
  const atacadaoTotal = alimentacaoTx.filter(t => t.subcategory?.toLowerCase().includes('atacad') || t.description.toLowerCase().includes('assai') || t.description.toLowerCase().includes('atacadao')).reduce((a, t) => a + t.amount, 0);
  const mercadoTotal = alimentacaoTx.filter(t => !t.subcategory?.toLowerCase().includes('padaria') && !t.subcategory?.toLowerCase().includes('atacad')).reduce((a, t) => a + t.amount, 0);

  const saudeTotal = monthTransactions.filter(t => t.categoryId === 'saude').reduce((a, t) => a + t.amount, 0);
  const combustivelTotal = monthTransactions.filter(t => t.categoryId === 'combustivel').reduce((a, t) => a + t.amount, 0);
  const oficinaTotal = monthTransactions.filter(t => t.categoryId === 'oficina').reduce((a, t) => a + t.amount, 0);
  const igrejaTotal = monthTransactions.filter(t => t.categoryId === 'outros_igreja').reduce((a, t) => a + t.amount, 0);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'alimentacao': return <Utensils className="w-4 h-4 text-amber-700" />;
      case 'combustivel': return <Fuel className="w-4 h-4 text-orange-700" />;
      case 'oficina': return <Wrench className="w-4 h-4 text-neutral-700" />;
      case 'saude': return <HeartPulse className="w-4 h-4 text-sky-700" />;
      case 'outros_igreja': return <Church className="w-4 h-4 text-purple-700" />;
      default: return <Tag className="w-4 h-4 text-neutral-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Month Navigator Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Resumo Financeiro Mensal
          </h1>
          <p className="text-xs text-neutral-500">
            Acompanhamento de entradas, dívidas ativas e despesas categorizadas
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <button
            onClick={() => onChangeMonth(-1)}
            className="p-1.5 border border-neutral-300 rounded hover:bg-neutral-100 transition-colors text-neutral-700 cursor-pointer"
            title="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 font-semibold text-sm text-neutral-800 bg-neutral-100 rounded border border-neutral-200 min-w-36 text-center">
            {getMonthName(currentMonth)} de {currentYear}
          </div>
          <button
            onClick={() => onChangeMonth(1)}
            className="p-1.5 border border-neutral-300 rounded hover:bg-neutral-100 transition-colors text-neutral-700 cursor-pointer"
            title="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main KPI Cards - Simple & High Legibility */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entradas */}
        <div className="p-4 bg-white border border-neutral-200 rounded-md">
          <div className="flex items-center justify-between text-neutral-600 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Ativos Recebidos (Entrada)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {formatBRL(totalIncome)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {monthTransactions.filter(t => t.type === 'income').length} recebimentos no mês
          </div>
        </div>

        {/* Despesas Pagas */}
        <div className="p-4 bg-white border border-neutral-200 rounded-md">
          <div className="flex items-center justify-between text-neutral-600 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Despesas Realizadas</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {formatBRL(totalExpenses)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {monthTransactions.filter(t => t.type === 'expense').length} pagamentos efetuados
          </div>
        </div>

        {/* Dívidas do Mês */}
        <div className="p-4 bg-white border border-neutral-200 rounded-md">
          <div className="flex items-center justify-between text-neutral-600 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Dívidas do Mês (Faturas/Contas)</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {formatBRL(totalDebtsMonthly)}
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex justify-between items-center">
            <span>Faturas e parcelas a vencer</span>
            <button 
              onClick={() => onGoToTab('debts')}
              className="text-neutral-700 underline font-medium hover:text-neutral-900 cursor-pointer"
            >
              Ver dívidas
            </button>
          </div>
        </div>

        {/* Saldo Líquido do Mês */}
        <div className="p-4 bg-white border border-neutral-200 rounded-md">
          <div className="flex items-center justify-between text-neutral-600 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Saldo Líquido</span>
            <Wallet className="w-4 h-4 text-neutral-600" />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${netBalance >= 0 ? 'text-neutral-900' : 'text-rose-600'}`}>
            {formatBRL(netBalance)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Previsão pós-dívidas:{' '}
            <span className={`font-mono font-medium ${projectedRemaining >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatBRL(projectedRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Bancos Conectados: Nubank e Banco Neon */}
      <div className="bg-white border border-neutral-200 rounded-md p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Contas & Extratos Bancários Conectados
            </h2>
            <p className="text-xs text-neutral-500">
              Sincronização com Nubank e Banco Neon
            </p>
          </div>
          <button
            onClick={() => onGoToTab('banking')}
            className="text-xs font-medium text-neutral-700 hover:text-neutral-900 underline cursor-pointer"
          >
            Gerenciar Conexões & Importar Extratos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.filter(a => a.id !== 'dinheiro').map(acc => {
            const isNu = acc.id === 'nubank';
            const isSyncing = syncingBank === acc.id;

            return (
              <div 
                key={acc.id} 
                className="border border-neutral-200 rounded p-3 flex flex-col justify-between bg-neutral-50/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="inline-block w-3 h-3 rounded-sm"
                        style={{ backgroundColor: acc.bankBrandColor }}
                      />
                      <span className="font-bold text-sm text-neutral-900">{acc.name}</span>
                      <span className="text-xs text-neutral-400">· Ag {acc.agency} CC {acc.accountNumber}</span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {isNu ? 'Conta Digital Nubank' : 'Conta Digital Banco Neon'}
                    </div>
                  </div>

                  <button
                    onClick={() => onSyncBank(acc.id as 'nubank' | 'neon')}
                    disabled={isSyncing}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 border border-neutral-300 rounded bg-white hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Buscando...' : 'Buscar Extrato'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3 pt-2 border-t border-neutral-200/60">
                  <div>
                    <div className="text-xs text-neutral-500">Saldo Disponível</div>
                    <div className="text-base font-bold text-neutral-900 font-mono tabular-nums">
                      {formatBRL(acc.balance)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Fatura Atual do Cartão</div>
                    <div className="text-base font-bold text-amber-700 font-mono tabular-nums">
                      {formatBRL(acc.creditCardBill)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categorias Prioritárias Solicitadas pelo Usuário */}
      <div className="bg-white border border-neutral-200 rounded-md p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Onde está sendo gasto o dinheiro (Categorias Principais)
            </h2>
            <p className="text-xs text-neutral-500">
              Alimentação (Padaria/Mercado/Atacadão), Saúde (Farmácia), Combustível, Oficina e Igreja/Crianças
            </p>
          </div>
          <button
            onClick={() => onGoToTab('categories')}
            className="text-xs font-medium text-neutral-700 hover:text-neutral-900 underline cursor-pointer"
          >
            Ver Análise Detalhada
          </button>
        </div>

        {/* 5 Cards das Categorias Obrigatórias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Alimentação */}
          <div className="border border-neutral-200 rounded p-3 bg-white">
            <div className="flex items-center justify-between text-neutral-700 mb-1">
              <span className="text-xs font-bold">Alimentação</span>
              <Utensils className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-neutral-900 font-mono tabular-nums">
              {formatBRL(alimentacaoTx.reduce((a, t) => a + t.amount, 0))}
            </div>
            <div className="mt-2 space-y-1 text-xs text-neutral-500 border-t border-neutral-100 pt-2">
              <div className="flex justify-between">
                <span>Padaria:</span>
                <span className="font-mono text-neutral-800">{formatBRL(padariaTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Atacadão:</span>
                <span className="font-mono text-neutral-800">{formatBRL(atacadaoTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Mercado:</span>
                <span className="font-mono text-neutral-800">{formatBRL(mercadoTotal)}</span>
              </div>
            </div>
          </div>

          {/* 2. Saúde */}
          <div className="border border-neutral-200 rounded p-3 bg-white">
            <div className="flex items-center justify-between text-neutral-700 mb-1">
              <span className="text-xs font-bold">Saúde</span>
              <HeartPulse className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-lg font-bold text-neutral-900 font-mono tabular-nums">
              {formatBRL(saudeTotal)}
            </div>
            <div className="mt-2 space-y-1 text-xs text-neutral-500 border-t border-neutral-100 pt-2">
              <div className="flex justify-between">
                <span>Farmácia & Remédios:</span>
                <span className="font-mono text-neutral-800">{formatBRL(saudeTotal)}</span>
              </div>
              <div className="text-neutral-400">Drogasil, Raia, Farmácias</div>
            </div>
          </div>

          {/* 3. Combustível */}
          <div className="border border-neutral-200 rounded p-3 bg-white">
            <div className="flex items-center justify-between text-neutral-700 mb-1">
              <span className="text-xs font-bold">Combustível</span>
              <Fuel className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-neutral-900 font-mono tabular-nums">
              {formatBRL(combustivelTotal)}
            </div>
            <div className="mt-2 space-y-1 text-xs text-neutral-500 border-t border-neutral-100 pt-2">
              <div className="flex justify-between">
                <span>Postos de Gasolina:</span>
                <span className="font-mono text-neutral-800">{formatBRL(combustivelTotal)}</span>
              </div>
              <div className="text-neutral-400">Gasolina, Etanol, Posto</div>
            </div>
          </div>

          {/* 4. Oficina & Mecânica */}
          <div className="border border-neutral-200 rounded p-3 bg-white">
            <div className="flex items-center justify-between text-neutral-700 mb-1">
              <span className="text-xs font-bold">Oficina & Peças</span>
              <Wrench className="w-4 h-4 text-neutral-700" />
            </div>
            <div className="text-lg font-bold text-neutral-900 font-mono tabular-nums">
              {formatBRL(oficinaTotal)}
            </div>
            <div className="mt-2 space-y-1 text-xs text-neutral-500 border-t border-neutral-100 pt-2">
              <div className="flex justify-between">
                <span>Oficina / Troca Óleo:</span>
                <span className="font-mono text-neutral-800">{formatBRL(oficinaTotal)}</span>
              </div>
              <div className="text-neutral-400">Revisão, Peças, Consertos</div>
            </div>
          </div>

          {/* 5. Outros (Igreja & Crianças) */}
          <div className="border border-neutral-200 rounded p-3 bg-white">
            <div className="flex items-center justify-between text-neutral-700 mb-1">
              <span className="text-xs font-bold">Igreja & Crianças</span>
              <Church className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-neutral-900 font-mono tabular-nums">
              {formatBRL(igrejaTotal)}
            </div>
            <div className="mt-2 space-y-1 text-xs text-neutral-500 border-t border-neutral-100 pt-2">
              <div className="flex justify-between">
                <span>Lanches & Café Infantil:</span>
                <span className="font-mono text-neutral-800">{formatBRL(igrejaTotal)}</span>
              </div>
              <div className="text-neutral-400">Lanches das crianças na igreja</div>
            </div>
          </div>
        </div>

        {/* Barras de Proporção das Despesas */}
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <div className="text-xs font-medium text-neutral-600 mb-2">
            Distribuição Percentual dos Gastos do Mês
          </div>
          {totalExpenses === 0 ? (
            <div className="text-xs text-neutral-400 py-2">
              Nenhuma despesa registrada neste mês ainda.
            </div>
          ) : (
            <div className="space-y-2">
              {categoryTotals.map(c => (
                <div key={c.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                      {getCategoryIcon(c.id)}
                      <span>{c.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums text-neutral-900 font-semibold">
                        {formatBRL(c.total)}
                      </span>
                      <span className="text-neutral-400 font-mono w-10 text-right">
                        {c.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-sm overflow-hidden">
                    <div 
                      className="h-full rounded-sm"
                      style={{ 
                        width: `${Math.min(100, Math.max(2, c.percentage))}%`, 
                        backgroundColor: c.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
