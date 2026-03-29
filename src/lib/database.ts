import { supabase } from './supabase';
import type { Cagnotte, Contribution, Expense } from '../types';

class DatabaseService {
  // === CAGNOTTES ===

  async getAllCagnottes(): Promise<Cagnotte[]> {
    const { data, error } = await supabase
      .from('cagnottes')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data ?? []).map(row => ({
      id: row.id,
      name: row.name,
      goal: row.goal,
      currency: row.currency,
      createdAt: row.created_at,
      contributions: [],
      expenses: [],
    }));
  }

  async saveCagnotte(cagnotte: Cagnotte): Promise<void> {
    const { error } = await supabase
      .from('cagnottes')
      .upsert({
        id: cagnotte.id,
        name: cagnotte.name,
        goal: cagnotte.goal,
        currency: cagnotte.currency,
        created_at: cagnotte.createdAt,
      });

    if (error) throw error;
  }

  async deleteCagnotte(id: string): Promise<void> {
    // contributions and expenses are deleted by CASCADE in the DB schema
    const { error } = await supabase.from('cagnottes').delete().eq('id', id);
    if (error) throw error;
  }

  // === CONTRIBUTIONS ===

  async getContributions(cagnotteId: string): Promise<Contribution[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('cagnotte_id', cagnotteId)
      .order('date', { ascending: true });

    if (error) throw error;

    return (data ?? []).map(row => ({
      id: row.id,
      name: row.name,
      amount: row.amount,
      date: row.date,
    }));
  }

  async addContribution(cagnotteId: string, contribution: Contribution): Promise<void> {
    const { error } = await supabase.from('contributions').insert({
      id: contribution.id,
      cagnotte_id: cagnotteId,
      name: contribution.name,
      amount: contribution.amount,
      date: contribution.date,
    });

    if (error) throw error;
  }

  async deleteContribution(contributionId: string): Promise<void> {
    const { error } = await supabase.from('contributions').delete().eq('id', contributionId);
    if (error) throw error;
  }

  // === EXPENSES ===

  async getExpenses(cagnotteId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('cagnotte_id', cagnotteId)
      .order('date', { ascending: true });

    if (error) throw error;

    return (data ?? []).map(row => ({
      id: row.id,
      name: row.name,
      amount: row.amount,
      date: row.date,
    }));
  }

  async addExpense(cagnotteId: string, expense: Expense): Promise<void> {
    const { error } = await supabase.from('expenses').insert({
      id: expense.id,
      cagnotte_id: cagnotteId,
      name: expense.name,
      amount: expense.amount,
      date: expense.date,
    });

    if (error) throw error;
  }

  async deleteExpense(expenseId: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) throw error;
  }

  // === EXPORT/IMPORT ===

  async exportData(): Promise<string> {
    const [cagnottes, { data: contributions }, { data: expenses }] = await Promise.all([
      this.getAllCagnottes(),
      supabase.from('contributions').select('*'),
      supabase.from('expenses').select('*'),
    ]);

    return JSON.stringify({
      cagnottes,
      contributions: contributions ?? [],
      expenses: expenses ?? [],
      exportDate: new Date().toISOString(),
      version: '2.0',
      db: 'Supabase',
    }, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    if (!data.cagnottes || !Array.isArray(data.cagnottes)) {
      throw new Error('Format de données invalide');
    }

    // Clear existing data
    await this.clearAllData();

    // Import cagnottes
    for (const cagnotte of data.cagnottes) {
      await this.saveCagnotte(cagnotte);
    }

    // Import contributions
    if (data.contributions && Array.isArray(data.contributions)) {
      for (const contribution of data.contributions) {
        // Support both old IndexedDB export (cagnotteId) and Supabase export (cagnotte_id)
        const cagnotte_id = contribution.cagnotte_id ?? contribution.cagnotteId;
        if (cagnotte_id) {
          await this.addContribution(cagnotte_id, {
            id: contribution.id,
            name: contribution.name,
            amount: contribution.amount,
            date: contribution.date,
          });
        }
      }
    }

    // Import expenses
    if (data.expenses && Array.isArray(data.expenses)) {
      for (const expense of data.expenses) {
        // Support both old IndexedDB export (cagnotteId) and Supabase export (cagnotte_id)
        const cagnotte_id = expense.cagnotte_id ?? expense.cagnotteId;
        if (cagnotte_id) {
          await this.addExpense(cagnotte_id, {
            id: expense.id,
            name: expense.name,
            amount: expense.amount,
            date: expense.date,
          });
        }
      }
    }
  }

  // === STATISTIQUES ===

  async getStats(): Promise<{
    totalCagnottes: number;
    totalContributions: number;
    totalExpenses: number;
    dbSize: string;
  }> {
    const [
      { count: totalCagnottes },
      { count: totalContributions },
      { count: totalExpenses },
    ] = await Promise.all([
      supabase.from('cagnottes').select('*', { count: 'exact', head: true }),
      supabase.from('contributions').select('*', { count: 'exact', head: true }),
      supabase.from('expenses').select('*', { count: 'exact', head: true }),
    ]);

    const total = (totalCagnottes ?? 0) + (totalContributions ?? 0) + (totalExpenses ?? 0);
    const estimatedSize = (total * 500) / 1024;

    return {
      totalCagnottes: totalCagnottes ?? 0,
      totalContributions: totalContributions ?? 0,
      totalExpenses: totalExpenses ?? 0,
      dbSize: estimatedSize < 1024
        ? `${Math.round(estimatedSize)} KB`
        : `${(estimatedSize / 1024).toFixed(1)} MB`,
    };
  }

  // === MAINTENANCE ===

  async clearAllData(): Promise<void> {
    // Delete contributions and expenses first (FK constraints), then cagnottes
    await supabase.from('contributions').delete().not('id', 'is', null);
    await supabase.from('expenses').delete().not('id', 'is', null);
    await supabase.from('cagnottes').delete().not('id', 'is', null);
  }
}

export const dbService = new DatabaseService();
