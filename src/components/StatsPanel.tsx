import { Users, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { formatCurrency } from '../utils/formatCurrency';

interface StatsPanelProps {
  totalContributions: number;
  contributorCount: number;
  averageContribution: number;
  currency: string; // Ajout de la prop currency
}

export function StatsPanel({
  totalContributions,
  contributorCount,
  averageContribution,
  currency,
}: StatsPanelProps) {
  const stats = [
    {
      label: 'Total collecté',
      value: formatCurrency(totalContributions, currency),
      icon: Wallet,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Contributeurs',
      value: contributorCount.toString(),
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Moyenne',
      value: formatCurrency(averageContribution, currency),
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}