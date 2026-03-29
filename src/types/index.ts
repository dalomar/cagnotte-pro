export interface Contribution {
  id: string;
  name: string;
  amount: number;
  date: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
}

export interface Cagnotte {
  id: string;
  name: string;
  goal: number;
  currency: 'EUR' | 'GNF'; // Nouveau champ pour la devise
  deadline?: string;
  contributions: Contribution[];
  expenses: Expense[];
}

export type View = 'list' | 'detail';