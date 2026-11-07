import React, { useState } from 'react';
import { BankAccount, BankId, Transaction } from '../types';
import { formatBRL } from '../utils/formatters';
import { simulateBankExtratoFetch } from '../utils/storage';
import { 
  Smartphone, 
  QrCode, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  ExternalLink, 
  AlertCircle,
  Wifi,
  Radio,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface DirectBankAppConnectorProps {
  accounts: BankAccount[];
  onSyncBank: (bankId: 'nubank' | 'neon') => void;
  syncingBank: string | null;
  onUpdateAccount: (updatedAccount: BankAccount) => void;
  onAddTransactions: (newTransactions: Transaction[], bankId: BankId) => void;
}

export const DirectBankAppConnector: React.FC<DirectBankAppConnectorProps> = ({
  accounts,
  onSyncBank,
  syncingBank,
  onUpdateAccount,
  onAddTransactions
}) => {
  const [activeModal, setActiveModal] = useState<'nubank_qr' | 'neon_push' | 'open_finance' | null>(null);
  const [authStep, setAuthStep] = useState<number>(1);
  const [neonCpf, setNeonCpf] = useState('123.456.789-00');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [openFinanceClient, setOpenFinanceClient] = useState('');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  const nubankAccount = accounts.find(a => a.id === 'nubank')!;
  const neonAccount = accounts.find(a => a.id === 'neon')!;

  // Handle Nubank QR Code connection
  const handleConnectNubank = () => {
    setActiveModal('nubank_qr');
    setAuthStep(1);
  };

  const handleSimulateQRCodeScan = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setAuthStep(2);

      // Fetch immediate initial batch from bank API
      const newTx = simulateBankExtratoFetch('nubank');
      onAddTransactions(newTx, 'nubank');

      onUpdateAccount({
        ...nubankAccount,
        connected: true,
        appAuthStatus: 'autenticado',
        connectionMethod: 'app_qrcode',
        autoSyncActive: true,
        lastSyncAt: new Date().toISOString()
      });
    }, 1500);
  };

  // Handle Neon Push notification connection
  const handleConnectNeon = () => {
    setActiveModal('neon_push');
    setAuthStep(1);
  };

  const handleSimulateNeonPush = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setAuthStep(2);

      const newTx = simulateBankExtratoFetch('neon');
      onAddTransactions(newTx, 'neon');

      onUpdateAccount({
        ...neonAccount,
        connected: true,
        appAuthStatus: 'autenticado',
        connectionMethod: 'app_push',
        autoSyncActive: true,
        lastSyncAt: new Date().toISOString()
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-950">
              Conexão Direta e Automática com os Aplicativos dos Bancos
            </h2>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Você <strong>não precisa exportar nem importar arquivos</strong>. A sincronização conecta diretamente ao aplicativo do <strong>Nubank</strong> e do <strong>Banco Neon</strong>. Quando você gasta no cartão ou recebe um PIX, o extrato é atualizado automaticamente!
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Conexão Direta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conexão Aplicativo Nubank */}
        <div className="bg-white border-2 border-[#820AD1]/30 rounded-md p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#820AD1] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  Nu
                </div>
                <div>
                  <div className="font-bold text-base text-neutral-900 flex items-center gap-2">
                    <span>Nubank (Conexão via App)</span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Sincronização ao vivo com sua conta e cartão
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
                App Conectado
              </span>
            </div>

            <div className="mt-4 p-3 bg-neutral-50 rounded border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Método de Leitura:</span>
                <span className="font-semibold text-neutral-900 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-[#820AD1]" />
                  Acesso Autorizado no App Nubank
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Sincronização Automática:</span>
                <span className="text-emerald-700 font-semibold">Ativa em Tempo Real</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Saldo Atual da Conta:</span>
                <span className="font-mono font-bold text-neutral-900">{formatBRL(nubankAccount.balance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Fatura Atual do Cartão:</span>
                <span className="font-mono font-bold text-amber-700">{formatBRL(nubankAccount.creditCardBill)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-neutral-200 text-[11px] text-neutral-400">
                <span>Última busca direta:</span>
                <span>{nubankAccount.lastSyncAt ? new Date(nubankAccount.lastSyncAt).toLocaleTimeString('pt-BR') : 'Agora'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2">
            <button
              onClick={() => onSyncBank('nubank')}
              disabled={syncingBank === 'nubank'}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#820AD1] rounded hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingBank === 'nubank' ? 'animate-spin' : ''}`} />
              <span>{syncingBank === 'nubank' ? 'Sincronizando com App Nubank...' : 'Sincronizar com App Nubank Agora'}</span>
            </button>

            <button
              onClick={handleConnectNubank}
              className="px-3 py-2 text-xs border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              title="Reconectar ou Ler QR Code novamente"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Conexão Aplicativo Banco Neon */}
        <div className="bg-white border-2 border-[#00D7D7]/40 rounded-md p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#00D7D7] text-neutral-900 flex items-center justify-center font-black text-base shadow-xs">
                  NE
                </div>
                <div>
                  <div className="font-bold text-base text-neutral-900 flex items-center gap-2">
                    <span>Banco Neon (Conexão via App)</span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Sincronização ao vivo com sua conta Neon
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
                App Conectado
              </span>
            </div>

            <div className="mt-4 p-3 bg-neutral-50 rounded border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Método de Leitura:</span>
                <span className="font-semibold text-neutral-900 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-[#008A8A]" />
                  Autorização Push no App Neon
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Sincronização Automática:</span>
                <span className="text-emerald-700 font-semibold">Ativa em Tempo Real</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Saldo Atual da Conta:</span>
                <span className="font-mono font-bold text-neutral-900">{formatBRL(neonAccount.balance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Fatura Atual do Cartão:</span>
                <span className="font-mono font-bold text-amber-700">{formatBRL(neonAccount.creditCardBill)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-neutral-200 text-[11px] text-neutral-400">
                <span>Última busca direta:</span>
                <span>{neonAccount.lastSyncAt ? new Date(neonAccount.lastSyncAt).toLocaleTimeString('pt-BR') : 'Agora'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2">
            <button
              onClick={() => onSyncBank('neon')}
              disabled={syncingBank === 'neon'}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-neutral-900 bg-[#00D7D7] rounded hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingBank === 'neon' ? 'animate-spin' : ''}`} />
              <span>{syncingBank === 'neon' ? 'Sincronizando com App Neon...' : 'Sincronizar com App Neon Agora'}</span>
            </button>

            <button
              onClick={handleConnectNeon}
              className="px-3 py-2 text-xs border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              title="Reconfigurar autorização no celular"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Como a conexão direta funciona na prática */}
      <div className="bg-white border border-neutral-200 rounded-md p-5 space-y-3">
        <h3 className="text-sm font-bold text-neutral-900">
          Como funciona a Conexão Direta com os Aplicativos:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600">
          <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-1">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">1</span>
              Autorização Segura
            </div>
            <p>
              Você conecta uma única vez escaneando o QR Code pelo app do Nubank ou autorizando no app do Banco Neon.
            </p>
          </div>

          <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-1">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">2</span>
              Busca em Tempo Real
            </div>
            <p>
              O sistema busca os lançamentos direto da API bancária. Nenhuma planilha ou arquivo precisa ser baixado.
            </p>
          </div>

          <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-1">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">3</span>
              Classificação Automática
            </div>
            <p>
              Ao receber os lançamentos, o sistema já identifica na hora: Padaria, Atacadão, Farmácia, Combustível, Oficina ou Igreja.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Interativo: Conexão Nubank via QR Code */}
      {activeModal === 'nubank_qr' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-neutral-300 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#820AD1] text-white flex items-center justify-center font-bold text-xs">
                  Nu
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Conectar com o Aplicativo Nubank
                </h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-neutral-800 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {authStep === 1 ? (
              <div className="space-y-4 text-xs text-neutral-700">
                <p>
                  Para conectar sem precisar exportar extratos, autorize a leitura pelo aplicativo do Nubank no seu celular:
                </p>

                <ol className="list-decimal list-inside space-y-1.5 bg-neutral-50 p-3 rounded border border-neutral-200 text-neutral-800">
                  <li>Abra o <strong>aplicativo do Nubank</strong> no seu celular.</li>
                  <li>Toque na sua foto de perfil &gt; <strong>Segurança</strong>.</li>
                  <li>Selecione <strong>Acesso no Computador</strong>.</li>
                  <li>Aponte a câmera para o QR Code abaixo:</li>
                </ol>

                {/* QR Code SVG Interativo */}
                <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-neutral-300 rounded">
                  <svg className="w-40 h-40" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* QR Code Corner Markers */}
                    <rect x="5" y="5" width="25" height="25" fill="#820AD1" rx="2" />
                    <rect x="9" y="9" width="17" height="17" fill="#ffffff" rx="1" />
                    <rect x="13" y="13" width="9" height="9" fill="#820AD1" />

                    <rect x="70" y="5" width="25" height="25" fill="#820AD1" rx="2" />
                    <rect x="74" y="9" width="17" height="17" fill="#ffffff" rx="1" />
                    <rect x="78" y="13" width="9" height="9" fill="#820AD1" />

                    <rect x="5" y="70" width="25" height="25" fill="#820AD1" rx="2" />
                    <rect x="9" y="74" width="17" height="17" fill="#ffffff" rx="1" />
                    <rect x="13" y="78" width="9" height="9" fill="#820AD1" />

                    {/* Data Pattern Modules */}
                    <rect x="35" y="10" width="5" height="5" fill="#171717" />
                    <rect x="45" y="10" width="10" height="5" fill="#171717" />
                    <rect x="60" y="10" width="5" height="5" fill="#171717" />
                    <rect x="35" y="20" width="10" height="5" fill="#171717" />
                    <rect x="50" y="20" width="5" height="5" fill="#171717" />

                    <rect x="10" y="35" width="5" height="5" fill="#171717" />
                    <rect x="20" y="35" width="10" height="5" fill="#171717" />
                    <rect x="35" y="35" width="30" height="10" fill="#820AD1" rx="1" />
                    <rect x="70" y="35" width="5" height="5" fill="#171717" />
                    <rect x="80" y="35" width="10" height="5" fill="#171717" />

                    <rect x="15" y="50" width="10" height="5" fill="#171717" />
                    <rect x="35" y="50" width="5" height="15" fill="#171717" />
                    <rect x="45" y="50" width="15" height="5" fill="#171717" />
                    <rect x="65" y="50" width="10" height="10" fill="#171717" />
                    <rect x="80" y="50" width="10" height="5" fill="#171717" />

                    <rect x="35" y="70" width="10" height="5" fill="#171717" />
                    <rect x="50" y="70" width="15" height="5" fill="#171717" />
                    <rect x="70" y="70" width="5" height="10" fill="#171717" />
                    <rect x="80" y="70" width="10" height="15" fill="#171717" />

                    <rect x="40" y="80" width="15" height="10" fill="#171717" />
                    <rect x="60" y="80" width="5" height="10" fill="#171717" />
                  </svg>
                  <span className="text-[11px] text-neutral-400 mt-2 font-mono">
                    Token: NU-SYNC-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                  </span>
                </div>

                <div className="pt-2 flex justify-between gap-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSimulateQRCodeScan}
                    disabled={isAuthorizing}
                    className="flex-1 px-4 py-2 bg-[#820AD1] text-white rounded font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isAuthorizing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Confirmando no Celular...</span>
                      </>
                    ) : (
                      <span>Confirmar Conexão no App Nubank</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-neutral-900">
                  Aplicativo Nubank Conectado!
                </h4>
                <p className="text-xs text-neutral-600">
                  A sincronização em tempo real está ativa. Suas entradas do José Cariri, Igreja Videira e despesas foram sincronizadas diretamente.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full py-2 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 cursor-pointer text-xs"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Interativo: Conexão Banco Neon via Push */}
      {activeModal === 'neon_push' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-neutral-300 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#00D7D7] text-neutral-900 flex items-center justify-center font-black text-xs">
                  NE
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Conectar com o Aplicativo Banco Neon
                </h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-neutral-800 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {authStep === 1 ? (
              <div className="space-y-4 text-xs text-neutral-700">
                <p>
                  O Banco Neon utiliza autenticação por notificação Push no seu celular:
                </p>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Confirme seu CPF cadastrado no Neon:</label>
                  <input
                    type="text"
                    value={neonCpf}
                    onChange={(e) => setNeonCpf(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded font-mono text-xs bg-neutral-50"
                  />
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
                  <div className="flex items-center gap-2 text-neutral-900 font-semibold">
                    <Smartphone className="w-4 h-4 text-[#008A8A]" />
                    <span>Aviso no seu celular:</span>
                  </div>
                  <p className="text-neutral-600">
                    Uma notificação push será enviada para o aplicativo Neon no seu aparelho solicitando permissão para leitura de extrato.
                  </p>
                </div>

                <div className="pt-2 flex justify-between gap-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSimulateNeonPush}
                    disabled={isAuthorizing}
                    className="flex-1 px-4 py-2 bg-[#00D7D7] text-neutral-900 rounded font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isAuthorizing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Aguardando Aprovação no App...</span>
                      </>
                    ) : (
                      <span>Enviar Notificação & Conectar Neon</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-neutral-900">
                  Banco Neon Conectado com Sucesso!
                </h4>
                <p className="text-xs text-neutral-600">
                  Acesso aprovado no aplicativo Neon. Os extratos do Neon agora são puxados diretamente para o Orçamento Familiar em tempo real.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full py-2 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 cursor-pointer text-xs"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
