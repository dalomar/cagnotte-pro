import { useState, useEffect } from 'react';
import type { Cagnotte, Contribution, Expense } from '../types';
import { dbService } from '../lib/database';

export function useCagnotte() {
  const [cagnottes, setCagnottes] = useState<Cagnotte[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les données depuis Supabase au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Si un partage est présent dans l'URL, importer les données partagées
        const params = new URLSearchParams(window.location.search);
        const sharedData = params.get('data');

        if (sharedData) {
          try {
            const decoded = decodeURIComponent(escape(atob(sharedData)));
            await dbService.importData(decoded);
            // Supprimer le paramètre data de l'URL pour éviter de le réimporter automatiquement
            window.history.replaceState(null, '', window.location.pathname);
          } catch (importError) {
            console.error('Impossible d\'importer les données partagées depuis l\'URL :', importError);
          }
        }

        const loadedCagnottes = await dbService.getAllCagnottes();

        // Charger les contributions et dépenses pour chaque cagnotte
        const cagnottesWithData = await Promise.all(
          loadedCagnottes.map(async (cagnotte) => {
            const [contributions, expenses] = await Promise.all([
              dbService.getContributions(cagnotte.id),
              dbService.getExpenses(cagnotte.id),
            ]);

            return {
              ...cagnotte,
              contributions,
              expenses,
            };
          })
        );

        setCagnottes(cagnottesWithData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Fonction utilitaire pour sauvegarder une cagnotte
  const saveCagnotteToDB = async (cagnotte: Cagnotte) => {
    try {
      await dbService.saveCagnotte(cagnotte);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  const createCagnotte = async (name: string, goal: number, currency: 'EUR' | 'GNF' = 'GNF') => {
    const newCagnotte: Cagnotte = {
      id: Date.now().toString(),
      name,
      goal,
      currency: 'GNF', // Force GNF
      contributions: [],
      expenses: [],
      createdAt: new Date().toISOString(),
    };

    try {
      await saveCagnotteToDB(newCagnotte);
      setCagnottes(prev => [...prev, newCagnotte]);
      return newCagnotte.id;
    } catch (error) {
      console.error('Erreur lors de la création de la cagnotte:', error);
      throw error;
    }
  };

  const deleteCagnotte = async (id: string) => {
    try {
      await dbService.deleteCagnotte(id);
      setCagnottes(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la cagnotte:', error);
      throw error;
    }
  };

  const updateCagnotte = async (id: string, updates: Partial<Cagnotte>) => {
    try {
      setCagnottes(prev =>
        prev.map(c => {
          if (c.id === id) {
            const updated = { ...c, ...updates, currency: 'GNF' }; // Force GNF à la mise à jour
            saveCagnotteToDB(updated); // Sauvegarde asynchrone
            return updated;
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la cagnotte:', error);
      throw error;
    }
  };

  const addContribution = async (cagnotteId: string, name: string, amount: number) => {
    const newContribution: Contribution = {
      id: Date.now().toString(),
      name,
      amount,
      date: new Date().toISOString(),
    };

    try {
      await dbService.addContribution(cagnotteId, newContribution);

      setCagnottes(prev =>
        prev.map(c =>
          c.id === cagnotteId
            ? { ...c, contributions: [...c.contributions, newContribution] }
            : c
        )
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la contribution:', error);
      throw error;
    }
  };

  const removeContribution = async (cagnotteId: string, contributionId: string) => {
    try {
      await dbService.deleteContribution(contributionId);

      setCagnottes(prev =>
        prev.map(c =>
          c.id === cagnotteId
            ? { ...c, contributions: c.contributions.filter(con => con.id !== contributionId) }
            : c
        )
      );
    } catch (error) {
      console.error('Erreur lors de la suppression de la contribution:', error);
      throw error;
    }
  };

  const addExpense = async (cagnotteId: string, name: string, amount: number) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      name,
      amount,
      date: new Date().toISOString(),
    };

    try {
      await dbService.addExpense(cagnotteId, newExpense);

      setCagnottes(prev =>
        prev.map(c =>
          c.id === cagnotteId
            ? { ...c, expenses: [...c.expenses, newExpense] }
            : c
        )
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la dépense:', error);
      throw error;
    }
  };

  const removeExpense = async (cagnotteId: string, expenseId: string) => {
    try {
      await dbService.deleteExpense(expenseId);

      setCagnottes(prev =>
        prev.map(c =>
          c.id === cagnotteId
            ? { ...c, expenses: c.expenses.filter(exp => exp.id !== expenseId) }
            : c
        )
      );
    } catch (error) {
      console.error('Erreur lors de la suppression de la dépense:', error);
      throw error;
    }
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

  const exportData = async () => {
    try {
      const jsonData = await dbService.exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cagnottes-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw error;
    }
  };

  const shareData = async () => {
    try {
      const jsonData = await dbService.exportData();
      const base64 = btoa(unescape(encodeURIComponent(jsonData)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(base64)}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt('Copiez ce lien pour le partager :', shareUrl);
      }

      alert('Lien de partage copié dans le presse-papiers. Envoyez-le aux participants.');
      return shareUrl;
    } catch (error) {
      console.error('Erreur lors de la création du lien de partage :', error);
      throw error;
    }
  };

  const importData = async (file: File) => {
    try {
      const jsonData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
        reader.readAsText(file);
      });

      await dbService.importData(jsonData);

      // Recharger les données après l'import
      const loadedCagnottes = await dbService.getAllCagnottes();
      const cagnottesWithData = await Promise.all(
        loadedCagnottes.map(async (cagnotte) => {
          const [contributions, expenses] = await Promise.all([
            dbService.getContributions(cagnotte.id),
            dbService.getExpenses(cagnotte.id),
          ]);

          return {
            ...cagnotte,
            contributions,
            expenses,
          };
        })
      );

      setCagnottes(cagnottesWithData);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw error;
    }
  };

  const clearAllData = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
      try {
        await dbService.clearAllData();
        setCagnottes([]);
      } catch (error) {
        console.error('Erreur lors de la suppression des données:', error);
        throw error;
      }
    }
  };

  const getDatabaseStats = async () => {
    try {
      return await dbService.getStats();
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
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
    exportData,
    shareData,
    importData,
    clearAllData,
    getDatabaseStats,
  };
}