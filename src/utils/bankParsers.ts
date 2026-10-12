import { BankId, Transaction } from '../types';
import { detectCategory } from './categories';

export interface ParseResult {
  transactions: Transaction[];
  errors: string[];
  totalParsed: number;
}

// Helper to sanitize currency string (e.g. "R$ 1.250,50" or "-45.90" or "45,90")
export function parseBrazilianAmount(amountStr: string): { amount: number; isNegative: boolean } {
  let clean = amountStr.trim().replace(/^R\$\s*/i, '').trim();
  const isNegative = clean.startsWith('-') || clean.includes('débito') || clean.includes('debito');
  clean = clean.replace(/^-/, '').replace(/[^\d.,]/g, '');

  // If format is 1.234,56
  if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }

  const num = parseFloat(clean);
  return {
    amount: isNaN(num) ? 0 : Math.abs(num),
    isNegative
  };
}

// Parser for raw text pasted from Nubank or Neon
export function parsePastedBankText(text: string, defaultBank: BankId = 'nubank'): ParseResult {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const transactions: Transaction[] = [];
  const errors: string[] = [];

  // Patterns frequently found in bank copy-paste:
  // Ex 1: "12/10/2026 - Padaria Pão Quente - R$ 24,50"
  // Ex 2: "10/10/2026 Assaí Atacadista -320,00"
  // Ex 3: "PIX Recebido João 1.500,00 05/10/2026"
  // Ex 4: Nubank app paste format:
  // "Hoje" or "10 OUT" followed by "Drogaria São Paulo" and "- R$ 45,90"
  
  let currentDate = new Date().toISOString().split('T')[0];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is just a date header
    const dateMatch = line.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3] ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) : '2026';
      currentDate = `${year}-${month}-${day}`;
      continue;
    }

    // Try finding date within the line
    const inlineDateMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    let lineDate = currentDate;
    if (inlineDateMatch) {
      const day = inlineDateMatch[1].padStart(2, '0');
      const month = inlineDateMatch[2].padStart(2, '0');
      const year = inlineDateMatch[3] ? (inlineDateMatch[3].length === 2 ? `20${inlineDateMatch[3]}` : inlineDateMatch[3]) : '2026';
      lineDate = `${year}-${month}-${day}`;
    }

    // Try finding amount in the line: e.g. R$ 123,45 or -123,45 or 123,45
    const amountMatch = line.match(/(?:R\$\s*)?([+-]?\s*\d{1,3}(?:\.\d{3})*,\d{2}|[+-]?\s*\d+,\d{2}|[+-]?\s*\d+\.\d{2})/);
    if (amountMatch) {
      const rawAmountStr = amountMatch[0];
      const parsed = parseBrazilianAmount(rawAmountStr);
      
      // Determine description by stripping the date and amount
      let desc = line
        .replace(rawAmountStr, '')
        .replace(/\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?/, '')
        .replace(/[-–—•]/g, ' ')
        .trim();

      if (!desc && i > 0 && !lines[i - 1].match(/\d/)) {
        desc = lines[i - 1];
      }

      if (!desc) {
        desc = 'Lançamento Bancário';
      }

      // Check if it's income
      const lowerLine = line.toLowerCase();
      const isIncome = 
        lowerLine.includes('pix recebido') || 
        lowerLine.includes('transferencia recebida') || 
        lowerLine.includes('salario') ||
        lowerLine.includes('deposito') ||
        lowerLine.includes('ted recebida') ||
        (line.includes('+') && !parsed.isNegative);

      const type = isIncome ? 'income' : 'expense';
      const cat = detectCategory(desc, isIncome);

      transactions.push({
        id: `tx-parsed-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        date: lineDate,
        description: desc,
        amount: parsed.amount,
        type,
        bankId: defaultBank,
        categoryId: cat.categoryId,
        subcategory: cat.subcategory,
        paymentMethod: lowerLine.includes('pix') ? 'pix' : 'cartao_debito',
        rawBankText: line
      });
    }
  }

  return {
    transactions,
    errors,
    totalParsed: transactions.length
  };
}

// OFX Statement Parser (Very common export format for Nubank & Banco Neon)
export function parseOFX(ofxContent: string, defaultBank: BankId = 'nubank'): ParseResult {
  const transactions: Transaction[] = [];
  const errors: string[] = [];

  try {
    // Look for <STMTTRN> blocks
    const trnBlocks = ofxContent.split(/<STMTTRN>/i);

    for (let i = 1; i < trnBlocks.length; i++) {
      const block = trnBlocks[i].split(/<\/STMTTRN>/i)[0];
      
      // Extract TRNTYPE
      const typeMatch = block.match(/<TRNTYPE>([^<\r\n]+)/i);
      const trnType = typeMatch ? typeMatch[1].trim() : '';

      // Extract DTPOSTED: YYYYMMDD...
      const dateMatch = block.match(/<DTPOSTED>(\d{8})/i);
      let date = new Date().toISOString().split('T')[0];
      if (dateMatch) {
        const y = dateMatch[1].substring(0, 4);
        const m = dateMatch[1].substring(4, 6);
        const d = dateMatch[1].substring(6, 8);
        date = `${y}-${m}-${d}`;
      }

      // Extract TRNAMT
      const amtMatch = block.match(/<TRNAMT>([^<\r\n]+)/i);
      let amount = 0;
      let isNegative = true;
      if (amtMatch) {
        const val = parseFloat(amtMatch[1].trim());
        amount = Math.abs(val);
        isNegative = val < 0;
      }

      // Extract MEMO or NAME
      const memoMatch = block.match(/<MEMO>([^<\r\n]+)/i);
      const nameMatch = block.match(/<NAME>([^<\r\n]+)/i);
      const desc = (nameMatch ? nameMatch[1].trim() : (memoMatch ? memoMatch[1].trim() : 'Lançamento')).trim();

      const isIncome = trnType.toUpperCase() === 'CREDIT' || (!isNegative && amount > 0);
      const cat = detectCategory(desc, isIncome);

      transactions.push({
        id: `tx-ofx-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        date,
        description: desc,
        amount,
        type: isIncome ? 'income' : 'expense',
        bankId: defaultBank,
        categoryId: cat.categoryId,
        subcategory: cat.subcategory,
        paymentMethod: desc.toLowerCase().includes('pix') ? 'pix' : 'cartao_debito'
      });
    }
  } catch (err: any) {
    errors.push(`Erro ao processar arquivo OFX: ${err.message || 'Formato desconhecido'}`);
  }

  return {
    transactions,
    errors,
    totalParsed: transactions.length
  };
}

// CSV Parser (Nubank and Neon CSV statement exports)
export function parseCSV(csvContent: string, defaultBank: BankId = 'nubank'): ParseResult {
  const transactions: Transaction[] = [];
  const errors: string[] = [];

  try {
    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return { transactions: [], errors: ['Arquivo CSV vazio ou sem dados.'], totalParsed: 0 };
    }

    const header = lines[0].toLowerCase();
    // Nubank CSV typical headers: "date,title,amount" or "Data,Descrição,Valor,Identificador"
    // Neon CSV typical headers: "Data, Descrição, Tipo, Valor" or "Data;Descrição;Valor"
    const delimiter = header.includes(';') ? ';' : ',';

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.replace(/^["']|["']$/g, '').trim());
      if (parts.length < 3) continue;

      let date = parts[0];
      let desc = parts[1];
      let valStr = parts[2];

      // Convert date DD/MM/YYYY to YYYY-MM-DD if needed
      if (date.includes('/')) {
        const [d, m, y] = date.split('/');
        const fullYear = y && y.length === 2 ? `20${y}` : y || '2026';
        date = `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }

      const parsed = parseBrazilianAmount(valStr);
      const isIncome = desc.toLowerCase().includes('recebido') || 
                       desc.toLowerCase().includes('salário') ||
                       desc.toLowerCase().includes('depósito') ||
                       (!valStr.startsWith('-') && !parsed.isNegative && parts.some(p => p.toLowerCase().includes('crédito') || p.toLowerCase().includes('entrada')));

      const cat = detectCategory(desc, isIncome);

      transactions.push({
        id: `tx-csv-${Date.now()}-${i}`,
        date,
        description: desc,
        amount: parsed.amount,
        type: isIncome ? 'income' : 'expense',
        bankId: defaultBank,
        categoryId: cat.categoryId,
        subcategory: cat.subcategory,
        paymentMethod: desc.toLowerCase().includes('pix') ? 'pix' : 'cartao_credito'
      });
    }
  } catch (err: any) {
    errors.push(`Erro ao processar CSV: ${err.message}`);
  }

  return {
    transactions,
    errors,
    totalParsed: transactions.length
  };
}
