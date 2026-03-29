import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Edit, Plus, Minus, Share2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import type { Cagnotte, CagnotteStats } from '../types';

interface CagnotteDetailProps {
  cagnotte: Cagnotte;
  stats: CagnotteStats;
  onBack: () => void;
  onEdit: () => void;
  onAddContribution: () => void;
  onAddExpense: () => void;
}

export function CagnotteDetail({
  cagnotte,
  stats,
  onBack,
  onEdit,
  onAddContribution,
  onAddExpense,
}: CagnotteDetailProps) {
  const circumference = 2 * Math.PI * 54; // r=54
  const progress = Math.min(stats.percentage, 100);
  const dashOffset = circumference - (progress / 100) * circumference;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Lien copié !');
    } catch (err) {
      console.error('Erreur copie', err);
    }
  };

  const isGoalReached = stats.balance >= cagnotte.goal;

  return (
    <Card className="bg-white border-slate-200 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-slate-600 hover:bg-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="text-slate-600 hover:bg-slate-200"
            >
              <Edit className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-slate-600 hover:bg-slate-200"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-slate-800 text-center">
          {cagnotte.name}
        </CardTitle>
        <p className="text-center text-sm text-slate-500 font-medium mt-1">
          Devise : {cagnotte.currency}
        </p>
        {isGoalReached && (
          <p className="text-center text-emerald-600 font-bold text-lg mt-2 animate-pulse">
            🎉 Objectif atteint !
          </p>
        )}
      </CardHeader>

      <CardContent className="p-8">
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* Cercle de progression */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="54"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="80"
                cy="80"
                r="54"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${
                  progress >= 100
                    ? 'text-emerald-500'
                    : progress >= 50
                    ? 'text-amber-500'
                    : 'text-blue-500'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-800">
                {Math.min(stats.percentage, 100).toFixed(0)}%
              </span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
                Progression
              </span>
            </div>
          </div>

          {/* Montants */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Solde Actuel</p>
              <p className="text-4xl font-extrabold text-slate-800">
                {formatCurrency(stats.balance, cagnotte.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Objectif</p>
              <p className="text-2xl font-bold text-slate-600">
                {formatCurrency(cagnotte.goal, cagnotte.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={onAddContribution}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-14 text-lg font-semibold shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Contribution
          </Button>
          <Button
            onClick={onAddExpense}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 h-14 text-lg font-semibold"
          >
            <Minus className="w-5 h-5 mr-2" />
            Dépense
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}