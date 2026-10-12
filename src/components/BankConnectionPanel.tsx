import React, { useState } from 'react';
import { BankAccount, BankId, Transaction } from '../types';
import { formatBRL } from '../utils/formatters';
import { parseOFX, parseCSV, parsePastedBankText, ParseResult } from '../utils/bankParsers';
import { RefreshCw, Upload, FileText, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

interface BankConnectionPanelProps {
  accounts: BankAccount[];
  onSyncBank: (bankId: 'nubank' | 'neon') => void;
  syncingBank: string | null;
  onImportTransactions: (transactions: Transaction[], bankId: BankId) => void;
}

export const BankConnectionPanel: React.FC<BankConnectionPanelProps> = ({
  accounts,
  onSyncBank,
  syncingBank,
  onImportTransactions
}) => {
  const [selectedTargetBank, setSelectedTargetBank] = useState<BankId>('nubank');
  const [pastedText, setPastedText] = useState('');
  const [previewResult, setPreviewResult] = useState<ParseResult | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [activeImportMode, setActiveImportMode] = useState<'paste' | 'file'>('paste');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      let result: ParseResult;
      if (file.name.toLowerCase().endsWith('.ofx')) {
        result = parseOFX(content, selectedTargetBank);
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        result = parseCSV(content, selectedTargetBank);
      } else {
        result = parsePastedBankText(content, selectedTargetBank);
      }

      setPreviewResult(result);
      setFeedbackMessage(`Arquivo "${file.name}" lido com sucesso. ${result.totalParsed} transações identificadas.`);
    };

    reader.readAsText(file);
  };

  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setFeedbackMessage('Cole o texto do extrato bancário no campo abaixo antes de processar.');
      return;
    }

    const result = parsePastedBankText(pastedText, selectedTargetBank);
    setPreviewResult(result);
    if (result.totalParsed > 0) {
      setFeedbackMessage(`${result.totalParsed} lançamentos identificados e prontos para importar.`);
    } else {
      setFeedbackMessage('Não foi possível identificar valores ou linhas de extrato no texto colado. Tente o formato "DD/MM Nome R$ 0,00".');
    }
  };

  const handleConfirmImport = () => {
    if (!previewResult || previewResult.transactions.length === 0) return;

    onImportTransactions(previewResult.transactions, selectedTargetBank);
    setFeedbackMessage(`Sucesso! ${previewResult.transactions.length} transações foram adicionadas ao seu Orçamento Familiar.`);
    setPreviewResult(null);
    setPastedText('');
  };

  const sampleTexts = {
    nubank: `10/10/2026 Assaí Atacadista - R$ 380,00
11/10/2026 Padaria Rainha dos Pães - R$ 22,50
11/10/2026 Auto Posto Shell - R$ 160,00
12/10/2026 Drogaria São Paulo - R$ 45,90
12/10/2026 Oficina Auto Center - R$ 180,00
12/10/2026 PIX Recebido Wagner - R$ 1.200,00`,
    neon: `09/10/2026 Droga Raia - R$ 68,00
10/10/2026 Café da Manhã Crianças Igreja - R$ 42,00
11/10/2026 Posto Ipiranga Combustível - R$ 110,00
12/10/2026 Padaria Bom Pão - R$ 15,20`
  };

  const handleFillSample = () => {
    setPastedText(sampleTexts[selectedTargetBank === 'neon' ? 'neon' : 'nubank']);
    setPreviewResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Conexão de Bancos & Extratos
        </h1>
        <p className="text-xs text-neutral-500">
          Integração com Nubank e Banco Neon para busca automática de extratos e leitura de faturas
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-neutral-100 border border-neutral-300 rounded text-xs text-neutral-800 flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button 
            onClick={() => setFeedbackMessage(null)}
            className="text-neutral-500 hover:text-neutral-800 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cards de Status dos Bancos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Nubank */}
        {(() => {
          const nu = accounts.find(a => a.id === 'nubank')!;
          const isSyncing = syncingBank === 'nubank';

          return (
            <div className="bg-white border border-neutral-200 rounded-md p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-[#820AD1] text-white flex items-center justify-center font-bold text-sm">
                      Nu
                    </div>
                    <div>
                      <div className="font-bold text-base text-neutral-900">Nubank</div>
                      <div className="text-xs text-neutral-500">Nu Pagamentos S.A. · Banco 260</div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Conectado
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-neutral-100">
                  <div>
                    <div className="text-xs text-neutral-500">Saldo Atual em Conta</div>
                    <div className="text-lg font-bold text-neutral-900 font-mono tabular-nums">
                      {formatBRL(nu.balance)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Fatura Cartão Nubank</div>
                    <div className="text-lg font-bold text-amber-700 font-mono tabular-nums">
                      {formatBRL(nu.creditCardBill)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-neutral-500">
                  <span>Agência: {nu.agency} · Conta: {nu.accountNumber}</span>
                  <div className="text-neutral-400 mt-0.5">
                    Última sincronização de extrato: {nu.lastSyncAt ? new Date(nu.lastSyncAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Hoje'}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2">
                <button
                  onClick={() => onSyncBank('nubank')}
                  disabled={isSyncing}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#820AD1] rounded hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Buscando extrato no Nubank...' : 'Buscar Novos Extratos no Nubank'}</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Card Banco Neon */}
        {(() => {
          const neon = accounts.find(a => a.id === 'neon')!;
          const isSyncing = syncingBank === 'neon';

          return (
            <div className="bg-white border border-neutral-200 rounded-md p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-[#00D7D7] text-neutral-900 flex items-center justify-center font-black text-sm">
                      NE
                    </div>
                    <div>
                      <div className="font-bold text-base text-neutral-900">Banco Neon</div>
                      <div className="text-xs text-neutral-500">Neon Pagamentos · Banco Votorantim</div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Conectado
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-neutral-100">
                  <div>
                    <div className="text-xs text-neutral-500">Saldo Atual em Conta</div>
                    <div className="text-lg font-bold text-neutral-900 font-mono tabular-nums">
                      {formatBRL(neon.balance)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Fatura Cartão Neon</div>
                    <div className="text-lg font-bold text-amber-700 font-mono tabular-nums">
                      {formatBRL(neon.creditCardBill)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-neutral-500">
                  <span>Agência: {neon.agency} · Conta: {neon.accountNumber}</span>
                  <div className="text-neutral-400 mt-0.5">
                    Última sincronização de extrato: {neon.lastSyncAt ? new Date(neon.lastSyncAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Hoje'}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2">
                <button
                  onClick={() => onSyncBank('neon')}
                  disabled={isSyncing}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-900 bg-[#00D7D7] rounded hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Buscando extrato no Neon...' : 'Buscar Novos Extratos no Neon'}</span>
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Seção de Importação de Extratos (Arquivos OFX/CSV ou Colar Extrato do Celular) */}
      <div className="bg-white border border-neutral-200 rounded-md p-5">
        <div className="border-b border-neutral-200 pb-3 mb-4">
          <h2 className="text-base font-bold text-neutral-900">
            Importar Extrato Bancário Diretamente
          </h2>
          <p className="text-xs text-neutral-500">
            Você pode colar o texto copiado do app do Nubank/Neon ou carregar o arquivo exportado (.OFX ou .CSV)
          </p>
        </div>

        {/* Seleção do banco de destino e modo de importação */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-700">Conta de destino:</span>
            <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded border border-neutral-200">
              <button
                type="button"
                onClick={() => setSelectedTargetBank('nubank')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedTargetBank === 'nubank'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Nubank
              </button>
              <button
                type="button"
                onClick={() => setSelectedTargetBank('neon')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedTargetBank === 'neon'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Banco Neon
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded border border-neutral-200">
            <button
              type="button"
              onClick={() => setActiveImportMode('paste')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                activeImportMode === 'paste'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Colar Texto do Extrato</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveImportMode('file')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                activeImportMode === 'file'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Arquivo OFX / CSV</span>
            </button>
          </div>
        </div>

        {/* Modo 1: Colar Texto */}
        {activeImportMode === 'paste' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-700">
                Cole aqui as linhas do extrato (ex: copiado do aplicativo):
              </label>
              <button
                type="button"
                onClick={handleFillSample}
                className="text-xs text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
              >
                Preencher exemplo do {selectedTargetBank === 'nubank' ? 'Nubank' : 'Neon'}
              </button>
            </div>

            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Exemplo de linhas aceitas:&#10;10/10/2026 Padaria Bom Jesus R$ 25,00&#10;11/10/2026 Atacadão Assaí - R$ 340,00&#10;11/10/2026 Auto Posto Shell - R$ 150,00&#10;12/10/2026 Drogaria São Paulo - R$ 42,90&#10;12/10/2026 Lanches das Crianças na Igreja R$ 35,00"
              rows={5}
              className="w-full text-xs font-mono p-3 border border-neutral-300 rounded focus:outline-hidden focus:border-neutral-500 bg-neutral-50"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProcessPastedText}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Identificar e Categorizar Transações
              </button>
            </div>
          </div>
        )}

        {/* Modo 2: Upload de Arquivo */}
        {activeImportMode === 'file' && (
          <div className="border-2 border-dashed border-neutral-300 rounded-md p-6 text-center bg-neutral-50">
            <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
            <div className="text-xs font-medium text-neutral-800">
              Selecione o arquivo de extrato exportado do aplicativo
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Compatível com arquivos <strong>.OFX</strong> e <strong>.CSV</strong> do Nubank e Banco Neon
            </p>
            <div className="mt-4">
              <label className="inline-block px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors cursor-pointer">
                Selecionar Arquivo do Computador
                <input
                  type="file"
                  accept=".ofx,.csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Pré-visualização das transações identificadas */}
        {previewResult && previewResult.transactions.length > 0 && (
          <div className="mt-6 pt-5 border-t border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Pré-visualização: {previewResult.transactions.length} Lançamentos Encontrados
                </h3>
                <p className="text-xs text-neutral-500">
                  Categorizados automaticamente pelas palavras-chave (Padaria, Atacadão, Farmácia, Posto, Oficina, Igreja)
                </p>
              </div>

              <button
                onClick={handleConfirmImport}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 rounded hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar e Salvar no Orçamento</span>
              </button>
            </div>

            <div className="border border-neutral-200 rounded overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100 text-neutral-700 font-medium border-b border-neutral-200">
                  <tr>
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-3">Descrição</th>
                    <th className="py-2 px-3">Categoria Detectada</th>
                    <th className="py-2 px-3">Subcategoria</th>
                    <th className="py-2 px-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {previewResult.transactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="py-2 px-3 font-mono text-neutral-600">{tx.date}</td>
                      <td className="py-2 px-3 font-medium text-neutral-900">{tx.description}</td>
                      <td className="py-2 px-3 text-neutral-700 capitalize">
                        {tx.categoryId.replace('_', ' ')}
                      </td>
                      <td className="py-2 px-3 text-neutral-500">{tx.subcategory || '-'}</td>
                      <td className={`py-2 px-3 text-right font-mono font-bold tabular-nums ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-neutral-900'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'} {formatBRL(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
