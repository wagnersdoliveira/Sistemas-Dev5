import React from 'react';
import { UserAccount } from '../types';
import { PlusCircle, RefreshCw, Smartphone, Github, Users, User, LogOut } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewTransaction: () => void;
  onQuickSyncAll: () => void;
  isSyncing: boolean;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenUsersManagement: () => void;
  onOpenPWAInstall: () => void;
  onOpenGitHubExport: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTransaction,
  onQuickSyncAll,
  isSyncing,
  currentUser,
  onOpenAuth,
  onOpenUsersManagement,
  onOpenPWAInstall,
  onOpenGitHubExport,
  onLogout
}) => {
  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'transactions', label: 'Extratos & Lançamentos' },
    { id: 'debts', label: 'Dívidas & Faturas' },
    { id: 'banking', label: 'Conexão Bancos (Nubank / Neon)' },
    { id: 'categories', label: 'Análise de Gastos' },
  ];

  return (
    <header className="border-b border-neutral-200 bg-white">
      {/* Top Utility Bar for Mobile Install, GitHub & User Session */}
      <div className="bg-neutral-900 text-white text-[11px] py-1 px-4 sm:px-6 lg:px-8 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPWAInstall}
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer"
              title="Instalar no Android ou iPhone (iOS)"
            >
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>Instalar Aplicativo (Android & iOS)</span>
            </button>

            <span className="text-neutral-600 hidden sm:inline">|</span>

            <button
              onClick={onOpenGitHubExport}
              className="hidden sm:flex items-center gap-1.5 hover:text-neutral-300 transition-colors cursor-pointer"
              title="Subir código para seu repositório no GitHub"
            >
              <Github className="w-3 h-3" />
              <span>Subir para o GitHub</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 hidden sm:inline">Acesso:</span>
                <span className="font-semibold text-white">{currentUser.name}</span>
                <span className="text-neutral-400 font-mono hidden md:inline">({currentUser.cpf})</span>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={onOpenUsersManagement}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 cursor-pointer"
                    title="Controle de quem tem acesso"
                  >
                    <Users className="w-3 h-3 text-amber-400" />
                    <span>Controle de Acessos</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="text-neutral-400 hover:text-white ml-1 cursor-pointer flex items-center gap-0.5"
                  title="Sair da conta"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 text-white font-medium hover:underline cursor-pointer"
              >
                <User className="w-3 h-3" />
                <span>Entrar / Cadastro Prévio</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap">
              Orçamento Familiar
            </span>
            <span className="text-xs text-neutral-500 hidden sm:inline">
              Nubank · Neon
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
                  currentTab === tab.id
                    ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onQuickSyncAll}
              disabled={isSyncing}
              title="Buscar extratos atualizados nos bancos"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Buscando...' : 'Atualizar Extratos'}</span>
            </button>

            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo Lançamento</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex overflow-x-auto gap-3 py-2 border-t border-neutral-100 text-xs font-medium">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded cursor-pointer ${
                currentTab === tab.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
