import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Share2, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency } from '../utils/formatCurrency';
import type { Cagnotte } from '../types';

interface CagnotteCardProps {
  cagnotte: Cagnotte;
  stats: {
    balance: number;
    percentage: number;
    contributorCount: number;
    averageContribution: number;
  };
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}

export function CagnotteCard({ cagnotte, stats, onEdit, onDelete, onShare }: CagnotteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    if (isDeleting) {
      onDelete();
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  // Calcul de la circonférence pour le cercle de progression
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.percentage / 100) * circumference;

  // Couleur dynamique selon la progression
  const getProgressColor = () => {
    if (stats.percentage >= 100) return 'text-emerald-500';
    if (stats.percentage >= 80) return 'text-emerald-500';
    if (stats.percentage >= 50) return 'text-amber-500';
    return 'text-blue-500';
  };

  return (
    <Card className="border-slate-200 shadow-lg overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-slate-800">{cagnotte.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
              <Target className="w-4 h-4" />
              <span>Objectif : {formatCurrency(cagnotte.goal, cagnotte.currency)}</span>
            </div>
            {/* Affichage dynamique de la devise */}
            <div className="text-xs text-slate-400 mt-1">
              Devise : {cagnotte.currency}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="text-slate-500 hover:text-blue-500 hover:bg-blue-50"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteClick}
              className={`text-slate-500 hover:text-red-500 hover:bg-red-50 ${
                isDeleting ? 'bg-red-50 text-red-500 animate-pulse' : ''
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onShare}
              className="text-slate-500 hover:text-blue-500 hover:bg-blue-50"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          {/* Barre de progression circulaire */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-100"
              />
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={getProgressColor()}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-800">
                {Math.round(stats.percentage)}%
              </span>
              <span className="text-xs text-slate-500 mt-1">atteint</span>
            </div>
          </div>

          {/* Solde actuel */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 mb-1">Solde actuel</p>
            <p className="text-3xl font-bold text-slate-800">
              {formatCurrency(stats.balance, cagnotte.currency)}
            </p>
            {stats.percentage >= 100 && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-600 font-semibold mt-2"
              >
                🎉 Objectif atteint !
              </motion.p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}