import React, { useState } from 'react';
import { Github, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitCommands = `git init
git add .
git commit -m "feat: Sistema de Orçamento Familiar com Nubank, Neon e PWA"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/orcamento-familiar.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-neutral-300 max-w-xl w-full p-6 space-y-4 shadow-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-neutral-900" />
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Como Subir o Projeto para o seu GitHub
              </h2>
              <p className="text-xs text-neutral-500">
                Passo a passo para hospedar o código no seu repositório pessoal
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-800 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs text-neutral-700 overflow-y-auto">
          {/* Passo 1 */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-1">
            <span className="font-bold text-neutral-900">Passo 1: Crie um novo repositório no GitHub</span>
            <p className="text-neutral-600">
              Acesse <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-neutral-900 underline font-medium">github.com/new</a> e crie um repositório chamado <code>orcamento-familiar</code> (deixe como Público ou Privado).
            </p>
          </div>

          {/* Passo 2 */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900">Passo 2: Execute os comandos no seu terminal</span>
              <button
                onClick={() => copyToClipboard(gitCommands, 1)}
                className="flex items-center gap-1 text-[11px] font-medium text-neutral-700 hover:text-neutral-900 underline cursor-pointer"
              >
                {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedIndex === 1 ? 'Copiado!' : 'Copiar Comandos'}</span>
              </button>
            </div>

            <pre className="p-3 bg-neutral-900 text-neutral-100 rounded font-mono text-[11px] overflow-x-auto whitespace-pre">
{gitCommands}
            </pre>
            <p className="text-[11px] text-neutral-500">
              * Lembre-se de substituir <code>SEU_USUARIO</code> pelo seu nome de usuário no GitHub!
            </p>
          </div>

          {/* Passo 3 */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-1">
            <span className="font-bold text-neutral-900">Passo 3: Acesso e Deploy Gratuito a partir do GitHub</span>
            <p className="text-neutral-600">
              Com o código no seu GitHub, você pode:
            </p>
            <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-1">
              <li>
                Conectar na <strong>Vercel</strong> ou <strong>Netlify</strong> (1 clique para publicar online de graça com link próprio).
              </li>
              <li>
                Fazer o clone no seu computador e rodar com <code>npm install && npm run dev</code>.
              </li>
              <li>
                Compartilhar com quem você quiser para testes individuais.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
