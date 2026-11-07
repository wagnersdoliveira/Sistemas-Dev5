import React, { useState, useEffect } from 'react';
import { BankAccount, BankId, CategoryId, Debt, Transaction, UserAccount } from './types';
import { 
  getStoredAccounts, 
  getStoredDebts, 
  getStoredTransactions, 
  saveStoredAccounts, 
  saveStoredDebts, 
  saveStoredTransactions,
  simulateBankExtratoFetch,
  resetToDefaults
} from './utils/storage';
import { getCurrentUser, setCurrentUser as persistCurrentUser } from './utils/auth';
import { Header } from './components/Header';
import { MonthlyOverview } from './components/MonthlyOverview';
import { TransactionsTable } from './components/TransactionsTable';
import { DebtsManager } from './components/DebtsManager';
import { BankConnectionPanel } from './components/BankConnectionPanel';
import { CategoryAnalysis } from './components/CategoryAnalysis';
import { TransactionModal } from './components/TransactionModal';
import { AuthModal } from './components/AuthModal';
import { UserManagementModal } from './components/UserManagementModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { GitHubExportModal } from './components/GitHubExportModal';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 12)); // Outubro 2026
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [syncingBank, setSyncingBank] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // User Auth & Modals
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUsersManagementOpen, setIsUsersManagementOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);
  const [isGitHubExportOpen, setIsGitHubExportOpen] = useState(false);

  // Transaction Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  // Load initial data
  useEffect(() => {
    setAccounts(getStoredAccounts());
    setTransactions(getStoredTransactions());
    setDebts(getStoredDebts());
    setCurrentUser(getCurrentUser());
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  const handleUserChange = (user: UserAccount | null) => {
    setCurrentUser(user);
    persistCurrentUser(user);
    if (user) {
      showNotification(`Bem-vindo, ${user.name}!`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    persistCurrentUser(null);
    showNotification('Sessão encerrada com sucesso.');
  };

  const handleUpdateAccount = (updatedAccount: BankAccount) => {
    setAccounts((prev) => {
      const updated = prev.map(a => a.id === updatedAccount.id ? updatedAccount : a);
      saveStoredAccounts(updated);
      return updated;
    });
  };

  // Month navigation
  const handleChangeMonth = (delta: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev.getTime());
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  };

  // Bank statement sync simulation
  const handleSyncBank = (bankId: 'nubank' | 'neon') => {
    setSyncingBank(bankId);
    setTimeout(() => {
      const newItems = simulateBankExtratoFetch(bankId);
      
      setTransactions((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const toAdd = newItems.filter(item => !existingIds.has(item.id));
        const updated = [...toAdd, ...prev];
        saveStoredTransactions(updated);
        return updated;
      });

      // Update account last sync timestamp
      setAccounts((prev) => {
        const updated = prev.map(acc => {
          if (acc.id === bankId) {
            return {
              ...acc,
              lastSyncAt: new Date().toISOString()
            };
          }
          return acc;
        });
        saveStoredAccounts(updated);
        return updated;
      });

      setSyncingBank(null);
      const bankName = bankId === 'nubank' ? 'Nubank' : 'Banco Neon';
      showNotification(`Extrato do ${bankName} sincronizado com sucesso! Novos lançamentos foram categorizados.`);
    }, 700);
  };

  const handleQuickSyncAll = () => {
    setSyncingBank('all');
    setTimeout(() => {
      const nuItems = simulateBankExtratoFetch('nubank');
      const neonItems = simulateBankExtratoFetch('neon');
      const allNew = [...nuItems, ...neonItems];

      setTransactions((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const toAdd = allNew.filter(item => !existingIds.has(item.id));
        const updated = [...toAdd, ...prev];
        saveStoredTransactions(updated);
        return updated;
      });

      setAccounts((prev) => {
        const now = new Date().toISOString();
        const updated = prev.map(acc => ({
          ...acc,
          lastSyncAt: now
        }));
        saveStoredAccounts(updated);
        return updated;
      });

      setSyncingBank(null);
      showNotification('Extratos do Nubank e Banco Neon atualizados com sucesso!');
    }, 900);
  };

  // Import batch transactions from OFX/CSV/Pasted text
  const handleImportTransactions = (newItems: Transaction[], bankId: BankId) => {
    setTransactions((prev) => {
      const updated = [...newItems, ...prev];
      saveStoredTransactions(updated);
      return updated;
    });

    const bankName = bankId === 'nubank' ? 'Nubank' : bankId === 'neon' ? 'Banco Neon' : 'Carteira';
    showNotification(`${newItems.length} transações importadas com sucesso na conta ${bankName}.`);
  };

  // Transaction CRUD
  const handleSaveTransaction = (txData: Omit<Transaction, 'id'>, idToUpdate?: string) => {
    if (idToUpdate) {
      setTransactions((prev) => {
        const updated = prev.map(t => t.id === idToUpdate ? { ...txData, id: idToUpdate } : t);
        saveStoredTransactions(updated);
        return updated;
      });
      showNotification('Lançamento atualizado com sucesso.');
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-man-${Date.now()}`
      };
      setTransactions((prev) => {
        const updated = [newTx, ...prev];
        saveStoredTransactions(updated);
        return updated;
      });
      showNotification('Novo lançamento salvo no orçamento.');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Deseja realmente excluir este lançamento?')) {
      setTransactions((prev) => {
        const updated = prev.filter(t => t.id !== id);
        saveStoredTransactions(updated);
        return updated;
      });
      showNotification('Lançamento excluído.');
    }
  };

  const handleQuickChangeCategory = (txId: string, newCategoryId: CategoryId) => {
    setTransactions((prev) => {
      const updated = prev.map(t => {
        if (t.id === txId) {
          return { ...t, categoryId: newCategoryId };
        }
        return t;
      });
      saveStoredTransactions(updated);
      return updated;
    });
  };

  // Debts CRUD
  const handleAddDebt = (debtData: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debtData,
      id: `debt-${Date.now()}`
    };
    setDebts((prev) => {
      const updated = [...prev, newDebt];
      saveStoredDebts(updated);
      return updated;
    });
    showNotification('Nova dívida/compromisso adicionado.');
  };

  const handleUpdateDebt = (debt: Debt) => {
    setDebts((prev) => {
      const updated = prev.map(d => d.id === debt.id ? debt : d);
      saveStoredDebts(updated);
      return updated;
    });
    showNotification('Dívida atualizada.');
  };

  const handleDeleteDebt = (id: string) => {
    if (window.confirm('Deseja excluir esta dívida/compromisso?')) {
      setDebts((prev) => {
        const updated = prev.filter(d => d.id !== id);
        saveStoredDebts(updated);
        return updated;
      });
      showNotification('Dívida excluída.');
    }
  };

  const handleToggleDebtStatus = (id: string) => {
    setDebts((prev) => {
      const updated = prev.map(d => {
        if (d.id === id) {
          const newStatus = d.status === 'pago' ? ('pendente' as const) : ('pago' as const);
          return { ...d, status: newStatus };
        }
        return d;
      });
      saveStoredDebts(updated);
      return updated;
    });
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar os dados de demonstração originais? Todos os lançamentos serão reiniciados.')) {
      const def = resetToDefaults();
      setAccounts(def.accounts);
      setTransactions(def.transactions);
      setDebts(def.debts);
      showNotification('Dados restaurados com sucesso.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewTransaction={() => {
          setTransactionToEdit(null);
          setIsModalOpen(true);
        }}
        onQuickSyncAll={handleQuickSyncAll}
        isSyncing={syncingBank !== null}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenUsersManagement={() => setIsUsersManagementOpen(true)}
        onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
        onOpenGitHubExport={() => setIsGitHubExportOpen(true)}
        onLogout={handleLogout}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="bg-neutral-900 text-white text-xs px-4 py-2 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {notification}
            </span>
            <button
              onClick={() => setNotification(null)}
              className="text-neutral-400 hover:text-white ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <MonthlyOverview
            currentDate={currentDate}
            onChangeMonth={handleChangeMonth}
            transactions={transactions}
            accounts={accounts}
            debts={debts}
            onSyncBank={handleSyncBank}
            syncingBank={syncingBank}
            onGoToTab={setCurrentTab}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsTable
            transactions={transactions}
            accounts={accounts}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={(tx) => {
              setTransactionToEdit(tx);
              setIsModalOpen(true);
            }}
            onQuickChangeCategory={handleQuickChangeCategory}
            onOpenNewTransaction={() => {
              setTransactionToEdit(null);
              setIsModalOpen(true);
            }}
          />
        )}

        {currentTab === 'debts' && (
          <DebtsManager
            debts={debts}
            accounts={accounts}
            onAddDebt={handleAddDebt}
            onUpdateDebt={handleUpdateDebt}
            onDeleteDebt={handleDeleteDebt}
            onToggleStatus={handleToggleDebtStatus}
          />
        )}

        {currentTab === 'banking' && (
          <BankConnectionPanel
            accounts={accounts}
            onSyncBank={handleSyncBank}
            syncingBank={syncingBank}
            onImportTransactions={handleImportTransactions}
            onUpdateAccount={handleUpdateAccount}
          />
        )}

        {currentTab === 'categories' && (
          <CategoryAnalysis
            transactions={transactions}
            currentDate={currentDate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div>
            <strong>Orçamento Familiar</strong> · Sincronização Nubank & Banco Neon · Instalável em Android & iOS
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPWAInstallOpen(true)}
              className="text-neutral-700 hover:text-neutral-900 underline cursor-pointer"
            >
              Como Instalar no Celular
            </button>
            <button
              onClick={() => setIsGitHubExportOpen(true)}
              className="text-neutral-700 hover:text-neutral-900 underline cursor-pointer"
            >
              Exportar para o GitHub
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
              title="Restaurar dados de teste"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar dados
            </button>
          </div>
        </div>
      </footer>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTransactionToEdit(null);
        }}
        onSave={handleSaveTransaction}
        transactionToEdit={transactionToEdit}
      />

      {/* Auth Modal (Login / Cadastro Prévio) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
      />

      {/* User Management Modal (Controle de quem acessa) */}
      <UserManagementModal
        isOpen={isUsersManagementOpen}
        onClose={() => setIsUsersManagementOpen(false)}
        currentUser={currentUser}
      />

      {/* PWA / Mobile Install Instructions Modal */}
      <PWAInstallModal
        isOpen={isPWAInstallOpen}
        onClose={() => setIsPWAInstallOpen(false)}
      />

      {/* GitHub Export Modal */}
      <GitHubExportModal
        isOpen={isGitHubExportOpen}
        onClose={() => setIsGitHubExportOpen(false)}
      />
    </div>
  );
}
