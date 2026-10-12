import { BankAccount, Debt, Transaction } from '../types';

const STORAGE_KEYS = {
  ACCOUNTS: 'orcamento_familiar_accounts_v2',
  TRANSACTIONS: 'orcamento_familiar_transactions_v2',
  DEBTS: 'orcamento_familiar_debts_v2',
};

export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'nubank',
    name: 'Nubank',
    fullName: 'Nu Pagamentos S.A. (Conta do Nubank)',
    accountNumber: '4829104-1',
    agency: '0001',
    balance: 4350.80,
    creditCardBill: 1250.00,
    creditCardLimit: 5000.00,
    connected: true,
    lastSyncAt: new Date().toISOString(),
    bankBrandColor: '#820AD1' // Nubank Purple
  },
  {
    id: 'neon',
    name: 'Banco Neon',
    fullName: 'Neon Pagamentos / Banco Votorantim',
    accountNumber: '194820-8',
    agency: '0655',
    balance: 980.50,
    creditCardBill: 480.00,
    creditCardLimit: 2500.00,
    connected: true,
    lastSyncAt: new Date().toISOString(),
    bankBrandColor: '#00D7D7' // Neon Turquoise
  },
  {
    id: 'dinheiro',
    name: 'Carteira (Dinheiro)',
    fullName: 'Controle em Espécie / Carteira Física',
    accountNumber: 'Física',
    agency: '-',
    balance: 240.00,
    creditCardBill: 0,
    creditCardLimit: 0,
    connected: true,
    lastSyncAt: new Date().toISOString(),
    bankBrandColor: '#475569'
  }
];

export const INITIAL_DEBTS: Debt[] = [
  // Dívidas específicas com Everton Donizete Ferreira
  {
    id: 'debt-everton-aluguel',
    title: 'Aluguel Caução - Everton Donizete Ferreira',
    creditor: 'Everton Donizete Ferreira',
    bankId: 'nubank',
    totalAmount: 7700.00,
    monthlyAmount: 1100.00,
    installmentsTotal: 12,
    installmentsPaid: 5,
    dueDateDay: 10,
    categoryId: 'outros_geral',
    status: 'pendente',
    endDate: 'Abril de 2027',
    debtType: 'aluguel_caucao',
    notes: 'Aluguel caução que termina em abril de 2027 (obrigatoriedade mensal)'
  },
  {
    id: 'debt-everton-carro',
    title: 'Parcela do Carro - Everton Donizete Ferreira',
    creditor: 'Everton Donizete Ferreira',
    bankId: 'nubank',
    totalAmount: 17000.00,
    monthlyAmount: 850.00,
    installmentsTotal: 24,
    installmentsPaid: 4,
    dueDateDay: 15,
    categoryId: 'outros_geral',
    status: 'pendente',
    debtType: 'parcela_carro',
    notes: 'Parcela mensal fixa do veículo paga para Everton Donizete Ferreira'
  },
  {
    id: 'debt-everton-seguro',
    title: 'Seguro do Carro - Everton Donizete Ferreira',
    creditor: 'Everton Donizete Ferreira',
    bankId: 'nubank',
    totalAmount: 2340.00,
    monthlyAmount: 195.00,
    installmentsTotal: 12,
    installmentsPaid: 4,
    dueDateDay: 20,
    categoryId: 'outros_geral',
    status: 'pendente',
    debtType: 'seguro_carro',
    notes: 'Seguro do automóvel a ser pago todo mês para Everton Donizete Ferreira'
  },
  {
    id: 'debt-1',
    title: 'Fatura Cartão Nubank',
    creditor: 'Nubank Cartões',
    bankId: 'nubank',
    totalAmount: 1250.00,
    monthlyAmount: 1250.00,
    dueDateDay: 10,
    categoryId: 'outros_geral',
    status: 'pendente',
    debtType: 'cartao',
    notes: 'Compras gerais, mercado e combustível concentrados no cartão'
  },
  {
    id: 'debt-2',
    title: 'Fatura Cartão Neon',
    creditor: 'Banco Neon',
    bankId: 'neon',
    totalAmount: 480.00,
    monthlyAmount: 480.00,
    dueDateDay: 20,
    categoryId: 'outros_geral',
    status: 'pendente',
    debtType: 'cartao',
    notes: 'Assinaturas e farmácia'
  },
  {
    id: 'debt-3',
    title: 'Conserto do Carro na Oficina (2 de 4)',
    creditor: 'Oficina Auto Center Silva',
    bankId: 'nubank',
    totalAmount: 880.00,
    monthlyAmount: 220.00,
    installmentsTotal: 4,
    installmentsPaid: 1,
    dueDateDay: 15,
    categoryId: 'oficina',
    status: 'pendente',
    notes: 'Parcelamento sem juros da revisão e suspensão do carro'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Entradas Solicitadas no Nubank (Ativos Recebidos)
  {
    id: 'tx-videira-1',
    date: '2026-10-02',
    description: 'Igreja Videira Campinas - Trabalho Mensal (Dia 01 a 05)',
    amount: 3800.00,
    type: 'income',
    bankId: 'nubank',
    categoryId: 'renda',
    subcategory: 'Igreja Videira Campinas (Trabalho Mensal)',
    paymentMethod: 'pix',
    notes: 'Ativo mensal referente ao trabalho realizado na Igreja Videira de Campinas'
  },
  {
    id: 'tx-cariri-1',
    date: '2026-10-07',
    description: 'José Cariri dos Santos - Prestação de Serviço Casamento',
    amount: 1500.00,
    type: 'income',
    bankId: 'nubank',
    categoryId: 'renda',
    subcategory: 'José Cariri dos Santos (Serviço Casamento)',
    paymentMethod: 'pix',
    notes: 'Ativo recebido: Prestação de serviços de casamento para José Cariri dos Santos'
  },
  {
    id: 'tx-2',
    date: '2026-10-08',
    description: 'PIX Recebido - Trabalho Extra / Cliente',
    amount: 650.00,
    type: 'income',
    bankId: 'neon',
    categoryId: 'renda',
    subcategory: 'Serviços / Freelas',
    paymentMethod: 'pix'
  },

  // Alimentação (Padaria, Mercado, Atacadão)
  {
    id: 'tx-3',
    date: '2026-10-06',
    description: 'Assaí Atacadista - Compra do Mês',
    amount: 540.30,
    type: 'expense',
    bankId: 'nubank',
    categoryId: 'alimentacao',
    subcategory: 'Atacadão / Atacado',
    paymentMethod: 'cartao_debito'
  },
  {
    id: 'tx-4',
    date: '2026-10-09',
    description: 'Padaria Pão Dourado - Café e Pães',
    amount: 28.50,
    type: 'expense',
    bankId: 'neon',
    categoryId: 'alimentacao',
    subcategory: 'Padaria',
    paymentMethod: 'pix'
  },
  {
    id: 'tx-5',
    date: '2026-10-11',
    description: 'Supermercado Compre Bem - Frios e Hortifruti',
    amount: 115.80,
    type: 'expense',
    bankId: 'nubank',
    categoryId: 'alimentacao',
    subcategory: 'Mercado / Supermercado',
    paymentMethod: 'cartao_credito'
  },
  {
    id: 'tx-6',
    date: '2026-10-12',
    description: 'Padaria Estrela - Pão francês e leite',
    amount: 16.90,
    type: 'expense',
    bankId: 'dinheiro',
    categoryId: 'alimentacao',
    subcategory: 'Padaria',
    paymentMethod: 'dinheiro'
  },

  // Saúde (Farmácia)
  {
    id: 'tx-7',
    date: '2026-10-07',
    description: 'Drogaria São Paulo - Remédios contínuos',
    amount: 84.40,
    type: 'expense',
    bankId: 'neon',
    categoryId: 'saude',
    subcategory: 'Farmácia / Medicamentos',
    paymentMethod: 'cartao_debito'
  },
  {
    id: 'tx-8',
    date: '2026-10-10',
    description: 'Droga Raia - Vitamina e curativos',
    amount: 47.90,
    type: 'expense',
    bankId: 'nubank',
    categoryId: 'saude',
    subcategory: 'Farmácia / Medicamentos',
    paymentMethod: 'pix'
  },

  // Combustível
  {
    id: 'tx-9',
    date: '2026-10-04',
    description: 'Auto Posto Shell Portal - Gasolina Comum',
    amount: 180.00,
    type: 'expense',
    bankId: 'nubank',
    categoryId: 'combustivel',
    subcategory: 'Gasolina',
    paymentMethod: 'cartao_credito'
  },
  {
    id: 'tx-10',
    date: '2026-10-10',
    description: 'Posto Ipiranga Av Central - Etanol',
    amount: 120.00,
    type: 'expense',
    bankId: 'neon',
    categoryId: 'combustivel',
    subcategory: 'Etanol',
    paymentMethod: 'pix'
  },

  // Oficina
  {
    id: 'tx-11',
    date: '2026-10-03',
    description: 'Oficina Mecânica Auto Center Silva - Troca de Óleo e Filtro',
    amount: 250.00,
    type: 'expense',
    bankId: 'nubank',
    categoryId: 'oficina',
    subcategory: 'Troca de Óleo',
    paymentMethod: 'pix'
  },
  {
    id: 'tx-12',
    date: '2026-10-08',
    description: 'Auto Peças Bandeirantes - Pastilhas e Aditivo Radiador',
    amount: 145.00,
    type: 'expense',
    bankId: 'nubank',
    categoryId: 'oficina',
    subcategory: 'Peças & Acessórios',
    paymentMethod: 'cartao_debito'
  },

  // Outros (Igreja e Crianças)
  {
    id: 'tx-13',
    date: '2026-10-04',
    description: 'Café da Manhã Crianças da Igreja - Pães de Queijo e Suco',
    amount: 55.00,
    type: 'expense',
    bankId: 'neon',
    categoryId: 'outros_igreja',
    subcategory: 'Café da Manhã Infantil',
    paymentMethod: 'pix'
  },
  {
    id: 'tx-14',
    date: '2026-10-11',
    description: 'Lanches Ministério Infantil - Biscoitos e Frutas EBD',
    amount: 42.50,
    type: 'expense',
    bankId: 'nubank',
    categoryId: 'outros_igreja',
    subcategory: 'Lanches das Crianças',
    paymentMethod: 'cartao_debito'
  }
];

export function getStoredAccounts(): BankAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading accounts from localStorage', e);
  }
  return INITIAL_ACCOUNTS;
}

export function saveStoredAccounts(accounts: BankAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed saving accounts', e);
  }
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading transactions from localStorage', e);
  }
  return INITIAL_TRANSACTIONS;
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed saving transactions', e);
  }
}

export function getStoredDebts(): Debt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEBTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading debts from localStorage', e);
  }
  return INITIAL_DEBTS;
}

export function saveStoredDebts(debts: Debt[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  } catch (e) {
    console.error('Failed saving debts', e);
  }
}

export function resetToDefaults(): { accounts: BankAccount[]; transactions: Transaction[]; debts: Debt[] } {
  localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.DEBTS);
  return {
    accounts: INITIAL_ACCOUNTS,
    transactions: INITIAL_TRANSACTIONS,
    debts: INITIAL_DEBTS
  };
}

// Simulated real-time fetch from Nubank or Banco Neon API / Open Finance
export function simulateBankExtratoFetch(bankId: 'nubank' | 'neon'): Transaction[] {
  const today = new Date().toISOString().split('T')[0];
  
  if (bankId === 'nubank') {
    return [
      {
        id: `nu-sync-${Date.now()}-1`,
        date: today,
        description: 'Igreja Videira Campinas - Proventos Mensais',
        amount: 3800.00,
        type: 'income',
        bankId: 'nubank',
        categoryId: 'renda',
        subcategory: 'Igreja Videira Campinas (Trabalho Mensal)',
        paymentMethod: 'pix',
        notes: 'Entrada de trabalho mensal na Igreja Videira entre dia 1º e 5'
      },
      {
        id: `nu-sync-${Date.now()}-2`,
        date: today,
        description: 'José Cariri dos Santos - Pagamento Casamento',
        amount: 1500.00,
        type: 'income',
        bankId: 'nubank',
        categoryId: 'renda',
        subcategory: 'José Cariri dos Santos (Serviço Casamento)',
        paymentMethod: 'pix',
        notes: 'Ativo de prestação de serviços de casamento'
      },
      {
        id: `nu-sync-${Date.now()}-3`,
        date: today,
        description: 'Padaria Nova União - Pão e café',
        amount: 22.40,
        type: 'expense',
        bankId: 'nubank',
        categoryId: 'alimentacao',
        subcategory: 'Padaria',
        paymentMethod: 'cartao_debito'
      },
      {
        id: `nu-sync-${Date.now()}-4`,
        date: today,
        description: 'Auto Posto Petrobras - Abastecimento Gasolina',
        amount: 150.00,
        type: 'expense',
        bankId: 'nubank',
        categoryId: 'combustivel',
        subcategory: 'Gasolina',
        paymentMethod: 'cartao_credito'
      },
      {
        id: `nu-sync-${Date.now()}-5`,
        date: today,
        description: 'Atacadão S/A - Reposição de Despensa',
        amount: 289.70,
        type: 'expense',
        bankId: 'nubank',
        categoryId: 'alimentacao',
        subcategory: 'Atacadão / Atacado',
        paymentMethod: 'cartao_debito'
      }
    ];
  } else {
    return [
      {
        id: `neon-sync-${Date.now()}-1`,
        date: today,
        description: 'Farmácia Drogasil - Analgésico e vitaminas',
        amount: 58.90,
        type: 'expense',
        bankId: 'neon',
        categoryId: 'saude',
        subcategory: 'Farmácia / Medicamentos',
        paymentMethod: 'pix'
      },
      {
        id: `neon-sync-${Date.now()}-2`,
        date: today,
        description: 'Lanches Igreja - Bolo e refrigerante para crianças EBD',
        amount: 38.00,
        type: 'expense',
        bankId: 'neon',
        categoryId: 'outros_igreja',
        subcategory: 'Lanches das Crianças',
        paymentMethod: 'pix'
      },
      {
        id: `neon-sync-${Date.now()}-3`,
        date: today,
        description: 'Auto Elétrica e Baterias Silva - Lâmpadas farol',
        amount: 75.00,
        type: 'expense',
        bankId: 'neon',
        categoryId: 'oficina',
        subcategory: 'Peças & Acessórios',
        paymentMethod: 'cartao_debito'
      }
    ];
  }
}
