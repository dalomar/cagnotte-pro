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
  currency: string; // Nouveau champ pour la devise
  contributions: Contribution[];
  expenses: Expense[];
  createdAt: string;
}

export interface CagnotteStats {
  totalContributions: number;
  totalExpenses: number;
  balance: number;
  contributorCount: number;
  averageContribution: number;
  percentage: number;
}

export type View = 'list' | 'detail';