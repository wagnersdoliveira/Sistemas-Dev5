import React, { useState } from 'react';
import { UserAccount } from '../types';
import { getAllUsers, removeUser, toggleUserStatus } from '../utils/auth';
import { formatDateBR } from '../utils/formatters';
import { Users, Shield, Download, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [users, setUsers] = useState<UserAccount[]>(getAllUsers());

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const updated = toggleUserStatus(id);
    setUsers(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover o cadastro deste usuário?')) {
      const updated = removeUser(id);
      setUsers(updated);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'CPF', 'Email', 'Metodo_Login', 'Perfil', 'Data_Cadastro', 'Status'];
    const rows = users.map(u => [
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.cpf}"`,
      `"${u.email}"`,
      u.authProvider,
      u.role,
      u.createdAt,
      u.isActive ? 'Ativo' : 'Inativo'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `usuarios_cadastrados_orcamento_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-neutral-300 max-w-2xl w-full p-5 space-y-4 shadow-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-neutral-800" />
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Controle de Usuários & Quem Acessa o Sistema
              </h2>
              <p className="text-xs text-neutral-500">
                Acompanhe quem realizou cadastro prévio com Nome, CPF e e-mail
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

        <div className="flex items-center justify-between text-xs text-neutral-600">
          <div>
            Total de usuários cadastrados: <strong>{users.length}</strong>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Lista em CSV</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto border border-neutral-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-100 text-neutral-700 font-medium border-b border-neutral-200 sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Nome</th>
                <th className="py-2.5 px-3">CPF</th>
                <th className="py-2.5 px-3">E-mail</th>
                <th className="py-2.5 px-3">Método</th>
                <th className="py-2.5 px-3">Cadastro</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-neutral-50">
                  <td className="py-2.5 px-3 font-semibold text-neutral-900">
                    <div className="flex items-center gap-1.5">
                      {u.role === 'admin' && (
                        <span title="Administrador">
                          <Shield className="w-3.5 h-3.5 text-amber-600" />
                        </span>
                      )}
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-neutral-700 whitespace-nowrap">
                    {u.cpf}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600">
                    {u.email}
                  </td>
                  <td className="py-2.5 px-3 capitalize text-neutral-600">
                    {u.authProvider === 'apple' ? 'Apple ID' : u.authProvider === 'google' ? 'Google' : 'E-mail'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-neutral-500 whitespace-nowrap">
                    {formatDateBR(u.createdAt.split('T')[0])}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <button
                      onClick={() => handleToggle(u.id)}
                      disabled={u.role === 'admin'}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                        u.isActive 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-neutral-100 text-neutral-500 border border-neutral-300'
                      }`}
                    >
                      {u.isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-neutral-400" />
                          <span>Inativo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        title="Excluir cadastro"
                        className="p-1 text-neutral-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
