import React, { useState } from 'react';
import { UserAccount } from '../types';
import { formatCPF, loginUser, registerUser } from '../utils/auth';
import { ShieldCheck, Mail, Lock, User, FileText, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleGoogleLogin = () => {
    // If not registered yet, we capture basic details or simulate standard Google OAuth profile
    const googleEmail = email.trim() || 'wagnervocal41@gmail.com';
    const googleName = name.trim() || 'Wagner (Google Account)';
    const cleanCpf = cpf.trim() || '123.456.789-00';

    const result = registerUser({
      name: googleName,
      email: googleEmail,
      cpf: cleanCpf,
      authProvider: 'google'
    });

    if (result.success && result.user) {
      onUserChange(result.user);
      setSuccessMessage('Conectado via Conta Google!');
      setTimeout(() => onClose(), 800);
    } else {
      // Try login if already registered
      const logResult = loginUser(googleEmail);
      if (logResult.success && logResult.user) {
        onUserChange(logResult.user);
        setSuccessMessage('Login efetuado com a Conta Google!');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMessage(logResult.message);
      }
    }
  };

  const handleAppleLogin = () => {
    const appleEmail = email.trim() || 'usuario.apple@icloud.com';
    const appleName = name.trim() || 'Usuário iPhone (Apple ID)';
    const cleanCpf = cpf.trim() || '987.654.321-99';

    const result = registerUser({
      name: appleName,
      email: appleEmail,
      cpf: cleanCpf,
      authProvider: 'apple'
    });

    if (result.success && result.user) {
      onUserChange(result.user);
      setSuccessMessage('Conectado via ID Apple (iPhone)!');
      setTimeout(() => onClose(), 800);
    } else {
      const logResult = loginUser(appleEmail);
      if (logResult.success && logResult.user) {
        onUserChange(logResult.user);
        setSuccessMessage('Login efetuado com ID Apple!');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMessage(logResult.message);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isRegisterMode) {
      if (!name.trim()) {
        setErrorMessage('Por favor, informe seu nome completo.');
        return;
      }
      if (!cpf.trim() || cpf.replace(/\D/g, '').length < 11) {
        setErrorMessage('Por favor, informe um CPF válido com 11 dígitos.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Por favor, informe um e-mail válido.');
        return;
      }

      const res = registerUser({
        name,
        cpf,
        email,
        password,
        authProvider: 'email'
      });

      if (res.success && res.user) {
        onUserChange(res.user);
        setSuccessMessage('Cadastro realizado com sucesso! Acesso liberado.');
        setTimeout(() => onClose(), 900);
      } else {
        setErrorMessage(res.message);
      }
    } else {
      const res = loginUser(email, password);
      if (res.success && res.user) {
        onUserChange(res.user);
        setSuccessMessage('Login realizado com sucesso!');
        setTimeout(() => onClose(), 900);
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-neutral-300 max-w-md w-full p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {isRegisterMode ? 'Cadastro Prévio de Acesso' : 'Acesso ao Orçamento Familiar'}
            </h2>
            <p className="text-xs text-neutral-500">
              Controle de acesso por E-mail, Google ou Apple (iPhone)
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-800 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Botões Rápidos: Google & Apple */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 p-2 border border-neutral-300 rounded text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer bg-white"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Entrar com E-mail do Google</span>
          </button>

          <button
            type="button"
            onClick={handleAppleLogin}
            className="w-full flex items-center justify-center gap-2 p-2 border border-neutral-800 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.65-7.74-11.86-14.1-5.74-8.7-10.15-18.47-13.23-29.31-3.08-10.84-4.63-21.28-4.63-31.33 0-14.97 3.86-27.42 11.58-37.36 7.72-9.94 17.65-15.02 29.79-15.24 4.58 0 9.87 1.25 15.86 3.75 5.99 2.5 10.05 3.82 12.18 3.96 1.74-.27 5.75-1.66 12.03-4.17 6.28-2.51 11.45-3.67 15.52-3.48 11.52.65 20.91 4.79 28.18 12.41 7.27 7.62 11.69 16.92 13.26 27.9-10.23 6.1-15.24 14.54-15.02 25.32.22 8.7 3.65 16.03 10.3 21.99 6.65 5.96 14.37 9.4 23.16 10.33-2.07 6.64-4.8 13.06-8.2 19.26zM119.22 31.84c0-7.39 2.67-14.4 8.01-21.03 5.34-6.63 11.89-10.81 19.65-12.54.54 1.74.82 3.48.82 5.22 0 7.39-2.78 14.46-8.34 21.21-5.56 6.75-12.23 10.85-20.01 12.31-.08-1.74-.13-3.47-.13-5.17z"/>
            </svg>
            <span>Entrar com ID Apple (iPhone)</span>
          </button>
        </div>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-neutral-400">ou com e-mail e senha</span>
          </div>
        </div>

        {/* Formulário com validação de CPF e Nome */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegisterMode && (
            <>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Nome Completo:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-neutral-300 rounded focus:outline-hidden focus:border-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">CPF (obrigatório para cadastro):</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    className="w-full pl-8 pr-3 py-1.5 border border-neutral-300 rounded font-mono focus:outline-hidden focus:border-neutral-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-medium text-neutral-700 mb-1">E-mail:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2" />
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-neutral-300 rounded focus:outline-hidden focus:border-neutral-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Senha:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-neutral-300 rounded focus:outline-hidden focus:border-neutral-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {isRegisterMode ? 'Cadastrar e Acessar Orçamento' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="pt-2 border-t border-neutral-200 text-center text-xs">
          {isRegisterMode ? (
            <span className="text-neutral-600">
              Já possui cadastro?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setErrorMessage(null);
                }}
                className="text-neutral-900 font-bold underline cursor-pointer"
              >
                Fazer Login
              </button>
            </span>
          ) : (
            <span className="text-neutral-600">
              Novo por aqui?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setErrorMessage(null);
                }}
                className="text-neutral-900 font-bold underline cursor-pointer"
              >
                Fazer Cadastro Prévio (com Nome e CPF)
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
