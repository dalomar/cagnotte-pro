import { useState, useMemo } from 'react';
import { useCagnotte } from './hooks/useCagnotte';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { CagnotteList } from './components/CagnotteList';
import { CreateCagnotteDialog } from './components/CreateCagnotteDialog';
import { CagnotteDetail } from './components/CagnotteDetail';
import { ContributionForm } from './components/ContributionForm';
import { ContributorList } from './components/ContributorList';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { EditCagnotteDialog } from './components/EditCagnotteDialog';
import { TopContributors } from './components/TopContributors';
import { DataManager } from './components/DataManager';
import { formatCurrency } from './utils/formatCurrency';
import { type View } from './types';

function App() {
  const {
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
    importData,
    clearAllData,
    shareData,
  } = useCagnotte();

  const [view, setView] = useState<View>('list');
  const [selectedCagnotteId, setSelectedCagnotteId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isContributionFormOpen, setIsContributionFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const selectedCagnotte = cagnottes.find(c => c.id === selectedCagnotteId);
  const stats = selectedCagnotte ? getCagnotteStats(selectedCagnotte) : null;

  // Calculer les données triées pour l'affichage
  const { sortedContributions, topPayers, sortedExpenses } = useMemo(() => {
    if (!selectedCagnotte) {
      return { sortedContributions: [], topPayers: [], sortedExpenses: [] };
    }

    // Trier les contributions par date (plus récent en premier)
    const sortedContribs = [...selectedCagnotte.contributions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Agréger les contributions par nom pour trouver les top payeurs
    const aggregatedPayers = selectedCagnotte.contributions.reduce((acc, curr) => {
      if (!acc[curr.name]) {
        acc[curr.name] = { name: curr.name, total: 0, count: 0 };
      }
      acc[curr.name].total += curr.amount;
      acc[curr.name].count += 1;
      return acc;
    }, {} as Record<string, { name: string; total: number; count: number }>);

    const topPayersList = Object.values(aggregatedPayers)
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);

    // Trier les dépenses par date (plus récent en premier)
    const sortedExps = [...selectedCagnotte.expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      sortedContributions: sortedContribs,
      topPayers: topPayersList,
      sortedExpenses: sortedExps,
    };
  }, [selectedCagnotte]);

  const handleSelectCagnotte = (id: string) => {
    setSelectedCagnotteId(id);
    setView('detail');
  };

  const handleBack = () => {
    setSelectedCagnotteId(null);
    setView('list');
  };

  // Modification : Forcer la devise GNF par défaut
  const handleCreateCagnotte = (name: string, goal: number) => {
    const id = createCagnotte(name, goal, 'GNF');
    handleSelectCagnotte(id);
  };

  const handleAddContribution = (name: string, amount: number) => {
    if (selectedCagnotteId) {
      addContribution(selectedCagnotteId, name, amount);
    }
  };

  const handleAddExpense = (name: string, amount: number) => {
    if (selectedCagnotteId) {
      addExpense(selectedCagnotteId, name, amount);
    }
  };

  // Modification : Forcer la devise GNF lors de l'édition
  const handleSaveCagnotte = (name: string, goal: number) => {
    if (selectedCagnotteId) {
      updateCagnotte(selectedCagnotteId, { name, goal, currency: 'GNF' });
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      {/* Container élargi pour permettre la mise en page côte à côte */}
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-slate-800 mb-3 tracking-tight">CagnottePro</h1>
          <p className="text-xl text-slate-500 font-medium">Gérez vos collectes simplement</p>
        </header>

        {view === 'list' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <CagnotteList
              cagnottes={cagnottes}
              onSelect={handleSelectCagnotte}
              onCreate={() => setIsCreateDialogOpen(true)}
              onDelete={deleteCagnotte}
              getStats={getCagnotteStats}
            />

            <DataManager
              onExport={exportData}
              onImport={importData}
              onClear={clearAllData}
              onShare={shareData}
            />
          </div>
        )}

        {view === 'detail' && selectedCagnotte && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale : Détail de la cagnotte */}
            <div className="lg:col-span-2 space-y-6">
              <CagnotteDetail
                cagnotte={selectedCagnotte}
                stats={stats}
                onBack={handleBack}
                onEdit={() => setIsEditDialogOpen(true)}
                onAddContribution={() => setIsContributionFormOpen(true)}
                onAddExpense={() => setIsExpenseFormOpen(true)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                    Dernières Contributions ({selectedCagnotte.contributions.length})
                  </h3>
                  <ContributorList
                    contributions={sortedContributions}
                    currency={selectedCagnotte.currency}
                    onDelete={(id) => removeContribution(selectedCagnotteId!, id)}
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                    Dépenses ({selectedCagnotte.expenses.length})
                  </h3>
                  <ExpenseList
                    expenses={sortedExpenses}
                    currency={selectedCagnotte.currency}
                    onDelete={(id) => removeExpense(selectedCagnotteId!, id)}
                  />
                </div>
              </div>
            </div>

            {/* Colonne latérale : Top 15 des Payeurs */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                {topPayers.length > 0 && (
                  <TopContributors topPayers={topPayers} currency={selectedCagnotte.currency} />
                )}
                
                {/* Carte de statistiques rapides en bas de la colonne latérale */}
                {stats && (
                  <Card className="bg-white border-slate-200 shadow-md mt-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-slate-800">Résumé</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Moyenne / pers.</span>
                        <span className="text-xl font-bold text-slate-800">
                          {formatCurrency(stats.averageContribution, selectedCagnotte.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Progression</span>
                        <span className={`text-xl font-bold ${stats.percentage >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                          {Math.min(stats.percentage, 100).toFixed(0)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        <CreateCagnotteDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={handleCreateCagnotte}
        />

        <ContributionForm
          open={isContributionFormOpen}
          onClose={() => setIsContributionFormOpen(false)}
          onSubmit={handleAddContribution}
        />

        <ExpenseForm
          open={isExpenseFormOpen}
          onClose={() => setIsExpenseFormOpen(false)}
          onSubmit={handleAddExpense}
        />

        <EditCagnotteDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSaveCagnotte}
          currentName={selectedCagnotte?.name || ''}
          currentGoal={selectedCagnotte?.goal || 0}
        />
      </div>
    </div>
  );
}

export default App;