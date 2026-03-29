import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Cagnotte, Contribution, Expense } from '../types';

interface CagnotteDB extends DBSchema {
  cagnottes: {
    key: string;
    value: Cagnotte;
    indexes: { 'by-name': string };
  };
  contributions: {
    key: string;
    value: Contribution & { cagnotteId: string };
    indexes: { 'by-cagnotte': string; 'by-date': string };
  };
  expenses: {
    key: string;
    value: Expense & { cagnotteId: string };
    indexes: { 'by-cagnotte': string; 'by-date': string };
  };
  metadata: {
    key: string;
    value: any;
  };
}

class DatabaseService {
  private db: IDBPDatabase<CagnotteDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<CagnotteDB>('cagnotte-pro-db', 1, {
      upgrade(db) {
        // Table des cagnottes
        if (!db.objectStoreNames.contains('cagnottes')) {
          const cagnotteStore = db.createObjectStore('cagnottes', { keyPath: 'id' });
          cagnotteStore.createIndex('by-name', 'name');
        }

        // Table des contributions
        if (!db.objectStoreNames.contains('contributions')) {
          const contributionStore = db.createObjectStore('contributions', { keyPath: 'id' });
          contributionStore.createIndex('by-cagnotte', 'cagnotteId');
          contributionStore.createIndex('by-date', 'date');
        }

        // Table des dépenses
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
          expenseStore.createIndex('by-cagnotte', 'cagnotteId');
          expenseStore.createIndex('by-date', 'date');
        }

        // Table des métadonnées
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata');
        }
      },
    });
  }

  // === CAGNOTTES ===

  async getAllCagnottes(): Promise<Cagnotte[]> {
    await this.init();
    return this.db!.getAll('cagnottes');
  }

  async saveCagnotte(cagnotte: Cagnotte): Promise<void> {
    await this.init();
    await this.db!.put('cagnottes', cagnotte);
  }

  async deleteCagnotte(id: string): Promise<void> {
    await this.init();
    // Supprimer aussi toutes les contributions et dépenses liées
    const tx = this.db!.transaction(['cagnottes', 'contributions', 'expenses'], 'readwrite');

    await Promise.all([
      tx.objectStore('cagnottes').delete(id),
      tx.objectStore('contributions').index('by-cagnotte').openCursor(IDBKeyRange.only(id)).then(cursor => {
        while (cursor) {
          cursor.delete();
          cursor.continue();
        }
      }),
      tx.objectStore('expenses').index('by-cagnotte').openCursor(IDBKeyRange.only(id)).then(cursor => {
        while (cursor) {
          cursor.delete();
          cursor.continue();
        }
      }),
    ]);

    await tx.done;
  }

  // === CONTRIBUTIONS ===

  async getContributions(cagnotteId: string): Promise<Contribution[]> {
    await this.init();
    const contributions = await this.db!.getAllFromIndex('contributions', 'by-cagnotte', cagnotteId);
    return contributions.map(({ cagnotteId: _, ...contrib }) => contrib);
  }

  async addContribution(cagnotteId: string, contribution: Contribution): Promise<void> {
    await this.init();
    await this.db!.add('contributions', { ...contribution, cagnotteId });
  }

  async deleteContribution(contributionId: string): Promise<void> {
    await this.init();
    await this.db!.delete('contributions', contributionId);
  }

  // === EXPENSES ===

  async getExpenses(cagnotteId: string): Promise<Expense[]> {
    await this.init();
    const expenses = await this.db!.getAllFromIndex('expenses', 'by-cagnotte', cagnotteId);
    return expenses.map(({ cagnotteId: _, ...expense }) => expense);
  }

  async addExpense(cagnotteId: string, expense: Expense): Promise<void> {
    await this.init();
    await this.db!.add('expenses', { ...expense, cagnotteId });
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await this.init();
    await this.db!.delete('expenses', expenseId);
  }

  // === EXPORT/IMPORT ===

  async exportData(): Promise<string> {
    await this.init();
    const [cagnottes, contributions, expenses] = await Promise.all([
      this.getAllCagnottes(),
      this.db!.getAll('contributions'),
      this.db!.getAll('expenses'),
    ]);

    return JSON.stringify({
      cagnottes,
      contributions,
      expenses,
      exportDate: new Date().toISOString(),
      version: '2.0',
      db: 'IndexedDB'
    }, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    if (!data.cagnottes || !Array.isArray(data.cagnottes)) {
      throw new Error('Format de données invalide');
    }

    await this.init();
    const tx = this.db!.transaction(['cagnottes', 'contributions', 'expenses'], 'readwrite');

    // Vider les tables existantes
    await Promise.all([
      tx.objectStore('cagnottes').clear(),
      tx.objectStore('contributions').clear(),
      tx.objectStore('expenses').clear(),
    ]);

    // Importer les nouvelles données
    for (const cagnotte of data.cagnottes) {
      await tx.objectStore('cagnottes').add(cagnotte);
    }

    if (data.contributions) {
      for (const contribution of data.contributions) {
        await tx.objectStore('contributions').add(contribution);
      }
    }

    if (data.expenses) {
      for (const expense of data.expenses) {
        await tx.objectStore('expenses').add(expense);
      }
    }

    await tx.done;
  }

  // === STATISTIQUES ===

  async getStats(): Promise<{
    totalCagnottes: number;
    totalContributions: number;
    totalExpenses: number;
    dbSize: string;
  }> {
    await this.init();

    const [cagnottes, contributions, expenses] = await Promise.all([
      this.db!.count('cagnottes'),
      this.db!.count('contributions'),
      this.db!.count('expenses'),
    ]);

    // Estimation de la taille (approximative)
    const totalRecords = cagnottes + contributions + expenses;
    const estimatedSize = (totalRecords * 500) / 1024; // ~500 bytes par enregistrement

    return {
      totalCagnottes: cagnottes,
      totalContributions: contributions,
      totalExpenses: expenses,
      dbSize: estimatedSize < 1024 ? `${Math.round(estimatedSize)} KB` : `${(estimatedSize / 1024).toFixed(1)} MB`
    };
  }

  // === MAINTENANCE ===

  async clearAllData(): Promise<void> {
    await this.init();
    const tx = this.db!.transaction(['cagnottes', 'contributions', 'expenses', 'metadata'], 'readwrite');

    await Promise.all([
      tx.objectStore('cagnottes').clear(),
      tx.objectStore('contributions').clear(),
      tx.objectStore('expenses').clear(),
      tx.objectStore('metadata').clear(),
    ]);

    await tx.done;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const dbService = new DatabaseService();