import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

interface TopPayer {
  name: string;
  total: number;
  count: number;
}

interface TopContributorsProps {
  topPayers: TopPayer[];
  currency: string;
}

export function TopContributors({ topPayers, currency }: TopContributorsProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-base font-bold text-slate-500">{rank}</span>;
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-slate-50 border-slate-200';
    if (rank === 3) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-slate-100';
  };

  if (topPayers.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border-amber-200 shadow-lg overflow-hidden sticky top-4">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100 pb-4">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Top 15 des Payeurs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-200">
              <th className="text-left p-4 font-bold text-slate-600 w-12">#</th>
              <th className="text-left p-4 font-bold text-slate-600">Contributeur</th>
              <th className="text-right p-4 font-bold text-slate-600">Total</th>
              <th className="text-center p-4 font-bold text-slate-600 w-16">Nb</th>
            </tr>
          </thead>
          <tbody>
            {topPayers.map((payer, index) => (
              <tr
                key={payer.name}
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${getRankClass(index + 1)}`}
              >
                <td className="p-4">
                  {getRankIcon(index + 1)}
                </td>
                <td className="p-4 font-semibold text-slate-800">
                  {payer.name}
                </td>
                <td className="p-4 text-right font-bold text-emerald-600 text-base">
                  {formatCurrency(payer.total, currency)}
                </td>
                <td className="p-4 text-center text-slate-500 font-medium">
                  {payer.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}