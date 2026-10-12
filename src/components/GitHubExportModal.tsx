import React, { useState } from 'react';
import { Github, Copy, Check, ExternalLink, Globe } from 'lucide-react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ isOpen, onClose }) => {
  const [githubUser, setGithubUser] = useState('wagnervocal41');
  const [repoName, setRepoName] = useState('orcamento-familiar');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentUsername = githubUser.trim() || 'seu-usuario';
  const currentRepo = repoName.trim() || 'orcamento-familiar';
  const githubRepoUrl = `https://github.com/${currentUsername}/${currentRepo}`;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitCommands = `git init
git add .
git commit -m "feat: Sistema de Orçamento Familiar com Nubank, Neon e PWA"
git branch -M main
git remote add origin ${githubRepoUrl}.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-neutral-300 max-w-xl w-full p-6 space-y-4 shadow-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-neutral-900" />
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Link do seu Repositório no GitHub
              </h2>
              <p className="text-xs text-neutral-500">
                Endereço onde o código do Orçamento Familiar ficará hospedado
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

        <div className="space-y-4 text-xs text-neutral-700 overflow-y-auto">
          {/* Card em destaque com o Link oficial do repositório */}
          <div className="p-3.5 bg-neutral-900 text-white rounded-md space-y-2">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
              O seu link oficial no GitHub será:
            </div>
            <div className="flex items-center justify-between gap-2 bg-neutral-800 p-2.5 rounded font-mono text-xs text-emerald-400 break-all">
              <span>{githubRepoUrl}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => copyToClipboard(githubRepoUrl, 99)}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  title="Copiar Link"
                >
                  {copiedIndex === 99 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={githubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 hover:text-white transition-colors"
                  title="Abrir no GitHub"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Configuração do seu usuário */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
            <span className="font-bold text-neutral-900 block">Personalizar Nome de Usuário:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-neutral-500 block mb-0.5">Seu usuário no GitHub:</label>
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  placeholder="ex: wagnervocal41"
                  className="w-full p-1.5 border border-neutral-300 rounded font-mono bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-500 block mb-0.5">Nome do repositório:</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="orcamento-familiar"
                  className="w-full p-1.5 border border-neutral-300 rounded font-mono bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Passo a Passo */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
            <span className="font-bold text-neutral-900 block">1. Criar o repositório no GitHub:</span>
            <p>
              Acesse <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-neutral-900 underline font-medium">github.com/new</a> e digite <strong>{currentRepo}</strong> no nome.
            </p>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900">2. Comandos para enviar os arquivos:</span>
              <button
                type="button"
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
