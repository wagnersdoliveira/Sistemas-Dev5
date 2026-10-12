import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Apple, Globe, Download, CheckCircle2, ChevronRight, Share, PlusSquare } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'web'>('android');
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallAndroid = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-neutral-300 max-w-xl w-full p-6 space-y-4 shadow-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Como Usar: Navegador, Android e iPhone (iOS)
            </h2>
            <p className="text-xs text-neutral-500">
              O sistema foi preparado para rodar das três formas no seu dia a dia
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-800 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 3 Modos - Segmented selector */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded border border-neutral-200">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTab === 'android' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instalar no Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTab === 'ios' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-neutral-800" />
            <span>Instalar no iPhone (iOS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('web')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTab === 'web' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>Uso no Navegador</span>
          </button>
        </div>

        {/* Tab 1: Android */}
        {activeTab === 'android' && (
          <div className="space-y-4 text-xs text-neutral-700">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
              <span className="font-bold text-neutral-900 block">Opção 1: Instalação Instantânea (PWA WebAPK)</span>
              <p>
                No Android (Chrome, Edge ou Samsung Internet), você pode instalar o aplicativo diretamente com 1 clique, sem precisar baixar da Google Play Store. Ele fica na tela inicial com o ícone do <strong>Orçamento Familiar</strong> e abre sem as barras do navegador!
              </p>

              {isInstallable && (
                <div className="pt-2">
                  <button
                    onClick={handleInstallAndroid}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded font-medium hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Aplicativo no Android Agora</span>
                  </button>
                </div>
              )}

              {installSuccess && (
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aplicativo instalado com sucesso na sua tela inicial!</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
              <span className="font-bold text-neutral-900 block">Opção 2: Gerar pacote .APK nativo (Capacitor)</span>
              <p>
                Se você quiser gerar um arquivo <strong>.APK instalador</strong> para distribuir ou enviar por WhatsApp, basta rodar o Capacitor no código do projeto:
              </p>
              <div className="bg-neutral-900 text-neutral-100 p-2.5 rounded font-mono text-[11px] space-y-1">
                <div>npm run build</div>
                <div>npx cap add android</div>
                <div>npx cap open android</div>
              </div>
              <p className="text-neutral-500">
                O Android Studio abre e gera o arquivo <strong>app-release.apk</strong> instalável em qualquer celular Android.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: iOS / iPhone */}
        {activeTab === 'ios' && (
          <div className="space-y-4 text-xs text-neutral-700">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2.5">
              <span className="font-bold text-neutral-900 block">Como instalar no iPhone (Safari):</span>
              <p>
                A Apple não permite que sites instalem apps sem o consentimento no Safari, mas o sistema já tem as tags do iOS integradas:
              </p>

              <ol className="space-y-2 list-decimal list-inside bg-white p-3 border border-neutral-200 rounded">
                <li>
                  Abra este link no navegador <strong>Safari</strong> do seu iPhone.
                </li>
                <li className="flex items-start gap-1.5">
                  <span>Toque no botão de <strong>Compartilhar</strong></span>
                  <Share className="w-3.5 h-3.5 text-neutral-700 mt-0.5 inline" />
                  <span>(quadrado com uma seta apontando para cima na barra inferior).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span>Role a tela para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</span>
                </li>
                <li>
                  Confirme o nome <strong>Orçamento Familiar</strong> e toque em <strong>"Adicionar"</strong> no canto superior direito.
                </li>
              </ol>

              <div className="text-xs text-neutral-600 bg-amber-50 border border-amber-200 p-2 rounded">
                ✓ Pronto! O ícone do app aparecerá na tela do seu iPhone e funcionará como um aplicativo nativo em tela cheia.
              </div>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
              <span className="font-bold text-neutral-900 block">Opção App Store da Apple:</span>
              <p>
                Para publicar na App Store oficial, você usa o comando:
              </p>
              <div className="bg-neutral-900 text-neutral-100 p-2 rounded font-mono text-[11px]">
                npx cap add ios && npx cap open ios
              </div>
              <p className="text-neutral-500">
                Isso abre o Xcode no Mac e permite assinar com sua conta de desenvolvedor Apple.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Navegador Web */}
        {activeTab === 'web' && (
          <div className="space-y-3 text-xs text-neutral-700">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
              <span className="font-bold text-neutral-900 block">Acesso Online pelo Computador ou Celular:</span>
              <p>
                Você pode salvar o link nos favoritos do seu navegador favorito (Google Chrome, Firefox, Safari ou Edge).
              </p>
              <p>
                Todos os seus lançamentos, extratos do Nubank, extratos do Banco Neon e dívidas com o Everton ficam salvos localmente e seguros no seu dispositivo.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
