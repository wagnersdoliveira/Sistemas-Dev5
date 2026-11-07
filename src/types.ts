export type BankId = 'nubank' | 'neon' | 'dinheiro';

export type TransactionType = 'income' | 'expense';

export type CategoryId = 
  | 'alimentacao'
  | 'saude'
  | 'combustivel'
  | 'oficina'
  | 'outros_igreja'
  | 'renda'
  | 'outros_geral';

export interface BankAccount {
  id: BankId;
  name: string;
  fullName: string;
  accountNumber: string;
  agency: string;
  balance: number;
  creditCardBill: number;
  creditCardLimit: number;
  connected: boolean;
  lastSyncAt: string | null;
  bankBrandColor: string;
  syncMode?: 'automatic_app' | 'open_finance' | 'manual';
  autoSyncActive?: boolean;
  appAuthStatus?: 'autenticado' | 'aguardando_app' | 'desconectado';
  connectionMethod?: 'app_qrcode' | 'app_push' | 'open_finance';
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive for income, positive for expense (differentiated by type)
  type: TransactionType;
  bankId: BankId;
  categoryId: CategoryId;
  subcategory?: string;
  paymentMethod: 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia' | 'dinheiro';
  isRecurring?: boolean;
  notes?: string;
  rawBankText?: string;
}

export interface Debt {
  id: string;
  title: string;
  creditor: string;
  bankId: BankId;
  totalAmount: number;
  monthlyAmount: number;
  installmentsTotal?: number;
  installmentsPaid?: number;
  dueDateDay: number; // dia do mês (1-31)
  categoryId: CategoryId;
  status: 'pendente' | 'pago' | 'atrasado';
  notes?: string;
  endDate?: string; // ex: "Abril de 2027"
  debtType?: 'aluguel_caucao' | 'parcela_carro' | 'seguro_carro' | 'cartao' | 'outros';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  cpf: string;
  authProvider: 'email' | 'google' | 'apple';
  role: 'admin' | 'usuario';
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
}

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  description: string;
  iconName: string;
  color: string;
  keywords: string[];
  subcategories: string[];
}
