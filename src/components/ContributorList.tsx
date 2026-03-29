import { motion } from 'framer-motion';
import { Trash2, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { formatCurrency } from '../utils/formatCurrency';
import type { Contribution } from '../types';

interface ContributorListProps {
  contributions: Contribution[];
  currency: string; // Ajout de la prop currency
  onDelete: (id: string) => void;
}

export function ContributorList({ contributions, currency, onDelete }: ContributorListProps) {
  if (contributions.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-8 text-center">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Aucune contribution pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {contributions.map((contribution, index) => (
        <motion.div
          key={contribution.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {contribution.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{contribution.name}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(contribution.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-slate-800">
                  {formatCurrency(contribution.amount, currency)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(contribution.id)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}