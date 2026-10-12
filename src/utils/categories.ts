import { CategoryDefinition, CategoryId } from '../types';

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'alimentacao',
    label: 'Alimentação',
    description: 'Compras em padaria, mercado ou atacadão',
    iconName: 'Utensils',
    color: '#D97706', // Âmbar/Laranja sóbrio
    keywords: [
      'padaria', 'pao', 'panificadora', 'mercado', 'supermercado', 'atacadao', 
      'assai', 'carrefour', 'extra', 'hortifruti', 'acougue', 'feira', 'paes',
      'mercearia', 'quitanda', 'hipermercado', 'dia brasil', 'mambo', 'sonda',
      'lanchonete', 'restaurante', 'mcdonald', 'burger', 'ifood', 'churrascaria'
    ],
    subcategories: ['Padaria', 'Mercado / Supermercado', 'Atacadão / Atacado', 'Feira & Hortifruti', 'Lanches']
  },
  {
    id: 'saude',
    label: 'Saúde',
    description: 'Gastos em farmácia e remédios',
    iconName: 'HeartPulse',
    color: '#0284C7', // Azul sóbrio
    keywords: [
      'farmacia', 'drogaria', 'drogasil', 'droga raia', 'ultrafarma', 'pague menos',
      'sao paulo', 'panvel', 'medicamento', 'remedio', 'laboratorio', 'exame',
      'dentista', 'consulta', 'otica', 'oftalmo', 'hospital', 'posto de saude'
    ],
    subcategories: ['Farmácia / Medicamentos', 'Consultas & Exames', 'Dentista', 'Ótica']
  },
  {
    id: 'combustivel',
    label: 'Combustível',
    description: 'Abastecimento em postos de combustível',
    iconName: 'Fuel',
    color: '#EA580C', // Laranja escuro
    keywords: [
      'posto', 'combustivel', 'gasolina', 'etanol', 'alcool', 'gnv', 'diesel',
      'ipiranga', 'shell', 'petrobras', 'br distribuidora', 'ale', 'auto posto',
      'posto br', 'abastece'
    ],
    subcategories: ['Gasolina', 'Etanol', 'Diesel / GNV', 'Conveniência Posto']
  },
  {
    id: 'oficina',
    label: 'Oficina & Manutenção',
    description: 'Gastos em oficina mecânica, consertos e peças',
    iconName: 'Wrench',
    color: '#4B5563', // Cinza escuro sóbrio
    keywords: [
      'oficina', 'mecanica', 'auto pecas', 'autocenter', 'troca de oleo', 'pneu',
      'alinhamento', 'balanceamento', 'funilaria', 'lanternagem', 'mecanico',
      'freios', 'suspensao', 'pecas', 'lubrificante', 'escapamento', 'revisao',
      'auto eletrica', 'motopeças'
    ],
    subcategories: ['Oficina Mecânica', 'Troca de Óleo', 'Peças & Acessórios', 'Pneus & Alinhamento', 'Funilaria']
  },
  {
    id: 'outros_igreja',
    label: 'Outros (Igreja & Crianças)',
    description: 'Lanchinhos, café da manhã para crianças e despesas da igreja',
    iconName: 'Church',
    color: '#7C3AED', // Roxo sóbrio
    keywords: [
      'igreja', 'crianca', 'criancas', 'infantil', 'lanche', 'lanches',
      'cafe da manha', 'ministerio infantil', 'escola biblica', 'ebd',
      'culto', 'dizimo', 'oferta', 'cantina igreja', 'lanche infantil'
    ],
    subcategories: ['Lanches das Crianças', 'Café da Manhã Infantil', 'Materiais EBD', 'Ofertas & Contribuições']
  },
  {
    id: 'renda',
    label: 'Ativos Recebidos (Entradas)',
    description: 'Salário, Igreja Videira, casamentos e recebimentos no Nubank',
    iconName: 'TrendingUp',
    color: '#16A34A', // Verde sóbrio
    keywords: [
      'salario', 'proventos', 'ted recebida', 'pix recebido', 'pagamento recebido',
      'rendimento', 'deposito', 'adiantamento', 'comissao', 'honorarios',
      'freela', 'cliente', 'recebimento', 'videira', 'igreja videira', 'jose cariri',
      'cariri', 'casamento'
    ],
    subcategories: [
      'Igreja Videira Campinas (Trabalho Mensal)',
      'José Cariri dos Santos (Serviço Casamento)',
      'Salário Mensal',
      'PIX Recebido',
      'Serviços / Freelas',
      'Outras Entradas'
    ]
  },
  {
    id: 'outros_geral',
    label: 'Outros Gastos & Dívidas Gerais',
    description: 'Contas, aluguel caução, parcelas e seguro do carro (Everton Donizete)',
    iconName: 'Tag',
    color: '#6B7280',
    keywords: [
      'everton', 'everton donizete', 'aluguel', 'caucao', 'seguro',
      'enel', 'sabesp', 'copel', 'cemig', 'cpfl', 'internet', 'claro', 'vivo',
      'tim', 'condominio', 'iptu', 'ipva', 'cartorio'
    ],
    subcategories: [
      'Aluguel Caução (Everton Donizete)',
      'Parcela do Carro (Everton Donizete)',
      'Seguro do Carro (Everton Donizete)',
      'Energia / Água / Internet',
      'Moradia',
      'Diversos'
    ]
  }
];

export function detectCategory(description: string, isIncome: boolean = false): { categoryId: CategoryId; subcategory: string } {
  const normalized = description
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // 0. Reconhecimento específico das entradas prioritárias do usuário
  if (normalized.includes('videira')) {
    return { 
      categoryId: 'renda', 
      subcategory: 'Igreja Videira Campinas (Trabalho Mensal)' 
    };
  }
  if (normalized.includes('cariri') || (normalized.includes('casamento') && isIncome)) {
    return { 
      categoryId: 'renda', 
      subcategory: 'José Cariri dos Santos (Serviço Casamento)' 
    };
  }

  // 0.1 Reconhecimento específico das dívidas do Everton Donizete Ferreira
  if (normalized.includes('everton')) {
    if (normalized.includes('aluguel') || normalized.includes('caucao')) {
      return { categoryId: 'outros_geral', subcategory: 'Aluguel Caução (Everton Donizete)' };
    }
    if (normalized.includes('seguro')) {
      return { categoryId: 'outros_geral', subcategory: 'Seguro do Carro (Everton Donizete)' };
    }
    if (normalized.includes('carro') || normalized.includes('parcela')) {
      return { categoryId: 'outros_geral', subcategory: 'Parcela do Carro (Everton Donizete)' };
    }
    return { categoryId: 'outros_geral', subcategory: 'Dívida Everton Donizete Ferreira' };
  }

  if (isIncome) {
    return { categoryId: 'renda', subcategory: 'Ativos Recebidos' };
  }

  // 1. Igreja e Crianças check first if explicit
  if (
    normalized.includes('igreja') || 
    normalized.includes('crianca') || 
    normalized.includes('ebd') ||
    normalized.includes('cafe infantil') ||
    normalized.includes('lanche infantil')
  ) {
    let sub = 'Lanches das Crianças';
    if (normalized.includes('cafe')) sub = 'Café da Manhã Infantil';
    else if (normalized.includes('oferta') || normalized.includes('dizimo')) sub = 'Ofertas & Contribuições';
    return { categoryId: 'outros_igreja', subcategory: sub };
  }

  // 2. Oficina check
  for (const kw of CATEGORIES.find(c => c.id === 'oficina')!.keywords) {
    if (normalized.includes(kw)) {
      let sub = 'Oficina Mecânica';
      if (normalized.includes('oleo')) sub = 'Troca de Óleo';
      if (normalized.includes('pneu') || normalized.includes('alinhamento')) sub = 'Pneus & Alinhamento';
      if (normalized.includes('peca')) sub = 'Peças & Acessórios';
      return { categoryId: 'oficina', subcategory: sub };
    }
  }

  // 3. Combustivel check
  for (const kw of CATEGORIES.find(c => c.id === 'combustivel')!.keywords) {
    if (normalized.includes(kw)) {
      return { categoryId: 'combustivel', subcategory: 'Gasolina / Etanol' };
    }
  }

  // 4. Saude check
  for (const kw of CATEGORIES.find(c => c.id === 'saude')!.keywords) {
    if (normalized.includes(kw)) {
      return { categoryId: 'saude', subcategory: 'Farmácia / Medicamentos' };
    }
  }

  // 5. Alimentacao check
  for (const kw of CATEGORIES.find(c => c.id === 'alimentacao')!.keywords) {
    if (normalized.includes(kw)) {
      let sub = 'Mercado / Supermercado';
      if (normalized.includes('padaria') || normalized.includes('panificadora') || normalized.includes('pao')) {
        sub = 'Padaria';
      } else if (normalized.includes('atacadao') || normalized.includes('assai')) {
        sub = 'Atacadão / Atacado';
      } else if (normalized.includes('hortifruti') || normalized.includes('feira')) {
        sub = 'Feira & Hortifruti';
      }
      return { categoryId: 'alimentacao', subcategory: sub };
    }
  }

  // 6. Outros Geral
  for (const kw of CATEGORIES.find(c => c.id === 'outros_geral')!.keywords) {
    if (normalized.includes(kw)) {
      return { categoryId: 'outros_geral', subcategory: 'Contas & Serviços' };
    }
  }

  return { categoryId: 'outros_geral', subcategory: 'Geral' };
}
