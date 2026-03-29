import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Trash, Receipt } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import type { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  currency: string;
}

export function ExpenseList({ expenses, onDelete, currency }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      onDelete(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
    }
  };

  if (expenses.length === 0) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="py-12 text-center">
          <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-base text-slate-500 font-medium">Aucune dépense</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card
          key={expense.id}
          className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
                <Receipt className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-base">{expense.name}</p>
                <p className="text-sm text-slate-500 font-medium">
                  {new Date(expense.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-red-500 text-lg">
                -{formatCurrency(expense.amount, currency)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(expense.id)}
                className={`transition-all h-9 w-9 ${
                  deletingId === expense.id
                    ? 'bg-red-100 text-red-600'
                    : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}