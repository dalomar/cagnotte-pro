import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus, Trash2, ArrowRight, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import type { Cagnotte } from '../types';

interface CagnotteListProps {
  cagnottes: Cagnotte[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  getStats: (cagnotte: Cagnotte) => any;
}

export function CagnotteList({ cagnottes, onSelect, onCreate, onDelete, getStats }: CagnotteListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Mes Cagnottes</h2>
        <Button
          onClick={onCreate}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle
        </Button>
      </div>

      {cagnottes.length === 0 ? (
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="py-12 text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 font-medium mb-2">Aucune cagnotte</p>
            <p className="text-sm text-slate-500 mb-4">Créez votre première cagnotte pour commencer</p>
            <Button onClick={onCreate} variant="outline" className="border-slate-300">
              Créer une cagnotte
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cagnottes.map((cagnotte) => {
            const stats = getStats(cagnotte);
            return (
              <Card
                key={cagnotte.id}
                className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] cursor-pointer group"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1" onClick={() => onSelect(cagnotte.id)}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                          {cagnotte.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{cagnotte.name}</h3>
                          <p className="text-xs text-slate-500">
                            {cagnotte.contributions.length} contributeur(s) • {cagnotte.currency}
                          </p>
                        </div>
                      </div>
                      <div className="ml-13 space-y-1">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-emerald-600 font-medium">
                            +{formatCurrency(stats.totalContributions, cagnotte.currency)}
                          </span>
                          <span className="text-red-500 font-medium">
                            -{formatCurrency(stats.totalExpenses, cagnotte.currency)}
                          </span>
                          <span className="text-slate-800 font-bold">
                            = {formatCurrency(stats.balance, cagnotte.currency)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                            style={{ width: `${stats.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(stats.balance, cagnotte.currency)} / {formatCurrency(cagnotte.goal, cagnotte.currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Supprimer cette cagnotte ?')) {
                            onDelete(cagnotte.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelect(cagnotte.id)}
                        className="text-blue-500 hover:bg-blue-50"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}