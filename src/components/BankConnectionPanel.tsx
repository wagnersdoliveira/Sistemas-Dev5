import React, { useState } from 'react';
import { BankAccount, BankId, Transaction } from '../types';
import { DirectBankAppConnector } from './DirectBankAppConnector';
import { parseOFX, parseCSV, parsePastedBankText, ParseResult } from '../utils/bankParsers';
import { formatBRL } from '../utils/formatters';
import { Radio, FileText, Upload, CheckCircle2 } from 'lucide-react';

interface BankConnectionPanelProps {
  accounts: BankAccount[];
  onSyncBank: (bankId: 'nubank' | 'neon') => void;
  syncingBank: string | null;
  onImportTransactions: (transactions: Transaction[], bankId: BankId) => void;
  onUpdateAccount: (updatedAccount: BankAccount) => void;
}

export const BankConnectionPanel: React.FC<BankConnectionPanelProps> = ({
  accounts,
  onSyncBank,
  syncingBank,
  onImportTransactions,
  onUpdateAccount
}) => {
  const [activeTab, setActiveTab] = useState<'direct_app' | 'manual_file'>('direct_app');

  // Manual fallback state
  const [selectedTargetBank, setSelectedTargetBank] = useState<BankId>('nubank');
  const [pastedText, setPastedText] = useState('');
  const [previewResult, setPreviewResult] = useState<ParseResult | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

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
      setFeedbackMessage('Não foi possível identificar linhas no texto colado.');
    }
  };

  const handleConfirmImport = () => {
    if (!previewResult || previewResult.transactions.length === 0) return;
    onImportTransactions(previewResult.transactions, selectedTargetBank);
    setFeedbackMessage(`Sucesso! ${previewResult.transactions.length} transações adicionadas.`);
    setPreviewResult(null);
    setPastedText('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Conexão Direta com Nubank & Banco Neon
          </h1>
          <p className="text-xs text-neutral-500">
            Sincronização em tempo real integrada aos aplicativos bancários sem exportar arquivos
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded border border-neutral-200">
          <button
            type="button"
            onClick={() => setActiveTab('direct_app')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTab === 'direct_app'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>Conexão Direta aos Apps (Ao Vivo)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual_file')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTab === 'manual_file'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-neutral-500" />
            <span>Opção Manual (Arquivos)</span>
          </button>
        </div>
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

      {/* Tab 1: Conexão Direta aos Aplicativos */}
      {activeTab === 'direct_app' && (
        <DirectBankAppConnector
          accounts={accounts}
          onSyncBank={onSyncBank}
          syncingBank={syncingBank}
          onUpdateAccount={onUpdateAccount}
          onAddTransactions={onImportTransactions}
        />
      )}

      {/* Tab 2: Opção Manual Secundária */}
      {activeTab === 'manual_file' && (
        <div className="bg-white border border-neutral-200 rounded-md p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Opção Alternativa: Importação Manual
            </h3>
            <p className="text-xs text-neutral-500">
              Use esta opção apenas se estiver sem o celular no momento para autenticar diretamente
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-700">Conta:</span>
            <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded border border-neutral-200">
              <button
                type="button"
                onClick={() => setSelectedTargetBank('nubank')}
                className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${
                  selectedTargetBank === 'nubank' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Nubank
              </button>
              <button
                type="button"
                onClick={() => setSelectedTargetBank('neon')}
                className={`px-3 py-1 text-xs font-medium rounded cursor-pointer ${
                  selectedTargetBank === 'neon' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Banco Neon
              </button>
            </div>
          </div>

          <div>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Cole aqui o texto de extrato..."
              rows={4}
              className="w-full text-xs font-mono p-3 border border-neutral-300 rounded bg-neutral-50"
            />
            <div className="mt-2 flex justify-between items-center">
              <label className="text-xs text-neutral-600 underline cursor-pointer">
                Ou selecionar arquivo .OFX / .CSV
                <input
                  type="file"
                  accept=".ofx,.csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleProcessPastedText}
                className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded hover:bg-neutral-800 cursor-pointer"
              >
                Processar Texto
              </button>
            </div>
          </div>

          {previewResult && previewResult.transactions.length > 0 && (
            <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
              <span className="text-xs text-neutral-700 font-medium">
                {previewResult.transactions.length} lançamentos encontrados.
              </span>
              <button
                onClick={handleConfirmImport}
                className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded hover:bg-emerald-800 cursor-pointer"
              >
                Confirmar e Salvar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
