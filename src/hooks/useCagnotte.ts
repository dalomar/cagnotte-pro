import { useState, useEffect } from 'react';
import type { Cagnotte, Contribution, Expense } from '../types';

export function useCagnotte() {
  const [cagnottes, setCagnottes] = useState<Cagnotte[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cagnottes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration forcée : tout convertir en GNF
        const migrated = parsed.map((c: Cagnotte) => ({
          ...c,
          currency: 'GNF', // Force GNF pour tout le monde
        }));
        setCagnottes(migrated);
      } catch (e) {
        console.error('Error loading cagnottes:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cagnottes', JSON.stringify(cagnottes));
    }
  }, [cagnottes, isLoaded]);

  const createCagnotte = (name: string, goal: number, currency: 'EUR' | 'GNF' = 'GNF') => {
    const newCagnotte: Cagnotte = {
      id: Date.now().toString(),
      name,
      goal,
      currency: 'GNF', // Force GNF
      contributions: [],
      expenses: [],
    };
    setCagnottes(prev => [...prev, newCagnotte]);
    return newCagnotte.id;
  };

  const deleteCagnotte = (id: string) => {
    setCagnottes(prev => prev.filter(c => c.id !== id));
  };

  const updateCagnotte = (id: string, updates: Partial<Cagnotte>) => {
    setCagnottes(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, currency: 'GNF' } : c)) // Force GNF à la mise à jour
    );
  };

  const addContribution = (cagnotteId: string, name: string, amount: number) => {
    const newContribution: Contribution = {
      id: Date.now().toString(),
      name,
      amount,
      date: new Date().toISOString(),
    };
    setCagnottes(prev =>
      prev.map(c =>
        c.id === cagnotteId
          ? { ...c, contributions: [...c.contributions, newContribution] }
          : c
      )
    );
  };

  const removeContribution = (cagnotteId: string, contributionId: string) => {
    setCagnottes(prev =>
      prev.map(c =>
        c.id === cagnotteId
          ? { ...c, contributions: c.contributions.filter(con => con.id !== contributionId) }
          : c
      )
    );
  };

  const addExpense = (cagnotteId: string, name: string, amount: number) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      name,
      amount,
      date: new Date().toISOString(),
    };
    setCagnottes(prev =>
      prev.map(c =>
        c.id === cagnotteId
          ? { ...c, expenses: [...c.expenses, newExpense] }
          : c
      )
    );
  };

  const removeExpense = (cagnotteId: string, expenseId: string) => {
    setCagnottes(prev =>
      prev.map(c =>
        c.id === cagnotteId
          ? { ...c, expenses: c.expenses.filter(exp => exp.id !== expenseId) }
          : c
      )
    );
  };

  const getCagnotteStats = (cagnotte: Cagnotte) => {
    const totalContributions = cagnotte.contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalExpenses = cagnotte.expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalContributions - totalExpenses;
    
    const progress = cagnotte.goal > 0 
      ? Math.min(Math.max((balance / cagnotte.goal) * 100, 0), 100) 
      : 0;

    const contributorCount = cagnotte.contributions.length;
    const average = contributorCount > 0 ? totalContributions / contributorCount : 0;

    return {
      totalContributions,
      totalExpenses,
      balance,
      progress,
      percentage: progress,
      contributorCount,
      average,
      averageContribution: average,
    };
  };

  return {
    cagnottes,
    isLoaded,
    createCagnotte,
    deleteCagnotte,
    updateCagnotte,
    addContribution,
    removeContribution,
    addExpense,
    removeExpense,
    getCagnotteStats,
  };
}