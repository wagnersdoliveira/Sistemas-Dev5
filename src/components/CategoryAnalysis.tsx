import React, { useState } from 'react';
import { CategoryId, Transaction } from '../types';
import { formatBRL, formatDateBR } from '../utils/formatters';
import { CATEGORIES } from '../utils/categories';
import { 
  Utensils, 
  Fuel, 
  Wrench, 
  HeartPulse, 
  Church, 
  Tag, 
  ArrowRight,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';

interface CategoryAnalysisProps {
  transactions: Transaction[];
  currentDate: Date;
}

export const CategoryAnalysis: React.FC<CategoryAnalysisProps> = ({
  transactions,
  currentDate
}) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Selected category tab inside the analysis
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryId>('alimentacao');

  // Filter transactions for this month only
  const monthExpenses = transactions.filter(t => {
    const [y, m] = t.date.split('-').map(Number);
    return y === currentYear && m === currentMonth + 1 && t.type === 'expense';
  });

  const totalExpense = monthExpenses.reduce((acc, t) => acc + t.amount, 0);

  // Group by category
  const categoryStats = CATEGORIES.filter(c => c.id !== 'renda').map(cat => {
    const items = monthExpenses.filter(t => t.categoryId === cat.id);
    const sum = items.reduce((acc, t) => acc + t.amount, 0);
    const count = items.length;
    const avg = count > 0 ? sum / count : 0;
    const pct = totalExpense > 0 ? (sum / totalExpense) * 100 : 0;

    return {
      category: cat,
      items,
      sum,
      count,
      avg,
      pct
    };
  });

  const activeStat = categoryStats.find(s => s.category.id === activeCategoryTab) || categoryStats[0];

  // Specific analysis for Alimentação (Padaria vs Mercado vs Atacadão)
  const alimentacaoItems = monthExpenses.filter(t => t.categoryId === 'alimentacao');
  const padariaItems = alimentacaoItems.filter(t => 
    t.subcategory?.toLowerCase().includes('padaria') || 
    t.description.toLowerCase().includes('padaria') || 
    t.description.toLowerCase().includes('panificadora') ||
    t.description.toLowerCase().includes('pao')
  );
  const atacadaoItems = alimentacaoItems.filter(t => 
    t.subcategory?.toLowerCase().includes('atacad') || 
    t.description.toLowerCase().includes('assai') || 
    t.description.toLowerCase().includes('atacadao')
  );
  const mercadoItems = alimentacaoItems.filter(t => 
    !padariaItems.includes(t) && !atacadaoItems.includes(t)
  );

  const padariaTotal = padariaItems.reduce((a, t) => a + t.amount, 0);
  const atacadaoTotal = atacadaoItems.reduce((a, t) => a + t.amount, 0);
  const mercadoTotal = mercadoItems.reduce((a, t) => a + t.amount, 0);

  // Specific analysis for Outros (Igreja e Crianças)
  const igrejaItems = monthExpenses.filter(t => t.categoryId === 'outros_igreja');
  const lanchesItems = igrejaItems.filter(t => 
    t.description.toLowerCase().includes('lanche') || 
    t.description.toLowerCase().includes('biscoito') || 
    t.subcategory?.toLowerCase().includes('lanche')
  );
  const cafeItems = igrejaItems.filter(t => 
    t.description.toLowerCase().includes('cafe') || 
    t.subcategory?.toLowerCase().includes('cafe')
  );

  const getCategoryIcon = (id: CategoryId) => {
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
      {/* Title */}
      <div className="pb-2 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Análise de Gastos por Categoria
        </h1>
        <p className="text-xs text-neutral-500">
          Entenda exatamente para onde vai o dinheiro: Padaria, Atacadão, Farmácia, Posto, Oficina e Igreja
        </p>
      </div>

      {/* Grid de Seletor das Categorias Relevantes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {categoryStats.map(stat => {
          const isSelected = activeCategoryTab === stat.category.id;

          return (
            <button
              key={stat.category.id}
              onClick={() => setActiveCategoryTab(stat.category.id)}
              className={`p-3 text-left border rounded transition-colors cursor-pointer ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                  : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold truncate">{stat.category.label}</span>
              </div>
              <div className={`text-base font-bold font-mono tabular-nums ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                {formatBRL(stat.sum)}
              </div>
              <div className={`text-[10px] mt-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                {stat.count} compras · {stat.pct.toFixed(0)}% do mês
              </div>
            </button>
          );
        })}
      </div>

      {/* Seção Especial: Detalhamento de Alimentação (Padaria x Mercado x Atacadão) */}
      {activeCategoryTab === 'alimentacao' && (
        <div className="bg-white border border-neutral-200 rounded-md p-4 space-y-4">
          <div className="border-b border-neutral-100 pb-2">
            <h2 className="text-sm font-bold text-neutral-900">
              Desdobramento de Alimentação: Onde você comprou
            </h2>
            <p className="text-xs text-neutral-500">
              Separação entre compras do dia a dia (padaria), compras de reposição (mercado) e atacado (atacadão)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Padaria */}
            <div className="p-3 border border-amber-200 bg-amber-50/30 rounded">
              <div className="text-xs font-bold text-amber-900">1. Padaria & Café</div>
              <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
                {formatBRL(padariaTotal)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {padariaItems.length} compras de pães, café e frios
              </div>
            </div>

            {/* Mercado / Supermercado */}
            <div className="p-3 border border-neutral-200 bg-neutral-50 rounded">
              <div className="text-xs font-bold text-neutral-800">2. Mercado do Bairro</div>
              <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
                {formatBRL(mercadoTotal)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {mercadoItems.length} compras de hortifruti e mercearia
              </div>
            </div>

            {/* Atacadão / Assaí */}
            <div className="p-3 border border-neutral-200 bg-neutral-50 rounded">
              <div className="text-xs font-bold text-neutral-800">3. Atacadão / Compra do Mês</div>
              <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
                {formatBRL(atacadaoTotal)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {atacadaoItems.length} compras de atacado
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção Especial: Igreja & Crianças */}
      {activeCategoryTab === 'outros_igreja' && (
        <div className="bg-white border border-neutral-200 rounded-md p-4 space-y-4">
          <div className="border-b border-neutral-100 pb-2">
            <h2 className="text-sm font-bold text-neutral-900">
              Gastos na Igreja: Lanchinhos e Café da Manhã Infantil
            </h2>
            <p className="text-xs text-neutral-500">
              Controle específico de lanches da Escola Bíblica (EBD) e café da manhã para as crianças
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 border border-purple-200 bg-purple-50/30 rounded">
              <div className="text-xs font-bold text-purple-900">Lanches para as Crianças</div>
              <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
                {formatBRL(lanchesItems.reduce((a, t) => a + t.amount, 0))}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Biscoitos, sucos e lanchinhos
              </div>
            </div>

            <div className="p-3 border border-neutral-200 bg-neutral-50 rounded">
              <div className="text-xs font-bold text-neutral-800">Café da Manhã da Escola Bíblica / Culto</div>
              <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
                {formatBRL(cafeItems.reduce((a, t) => a + t.amount, 0))}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Pães de queijo, bolo e leite
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detalhamento da Categoria Selecionada */}
      <div className="bg-white border border-neutral-200 rounded-md p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            {getCategoryIcon(activeStat.category.id)}
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {activeStat.category.label}
              </h3>
              <p className="text-xs text-neutral-500">
                {activeStat.category.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              Total: <strong className="text-base text-neutral-900">{formatBRL(activeStat.sum)}</strong>
            </div>
            <div>
              Média por gasto: <strong className="text-neutral-700">{formatBRL(activeStat.avg)}</strong>
            </div>
          </div>
        </div>

        {/* Tabela de Lançamentos da Categoria Selecionada */}
        {activeStat.items.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            Nenhum lançamento registrado nesta categoria no mês atual.
          </div>
        ) : (
          <div className="border border-neutral-200 rounded overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-100 text-neutral-700 font-medium border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Descrição da Compra</th>
                  <th className="py-2.5 px-3">Banco</th>
                  <th className="py-2.5 px-3">Subcategoria</th>
                  <th className="py-2.5 px-3">Forma</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {activeStat.items.sort((a, b) => b.date.localeCompare(a.date)).map(tx => (
                  <tr key={tx.id} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-mono text-neutral-600 whitespace-nowrap">
                      {formatDateBR(tx.date)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-neutral-900">
                      {tx.description}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 capitalize">
                      {tx.bankId}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500">
                      {tx.subcategory || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500 uppercase text-[10px]">
                      {tx.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      {formatBRL(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
