import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ContributionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, amount: number) => void;
}

export function ContributionForm({ open, onClose, onSubmit }: ContributionFormProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && amount && parseFloat(amount) > 0) {
      onSubmit(name.trim(), parseFloat(amount));
      setName('');
      setAmount('');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Ajouter une contribution">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700">Nom du contributeur</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Marie Dupont"
            className="border-slate-200 focus:ring-emerald-500"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-slate-700">Montant (GNF)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex: 50000"
            min="0.01"
            step="0.01"
            className="border-slate-200 focus:ring-emerald-500"
            required
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-200 text-slate-700"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Ajouter
          </Button>
        </div>
      </form>
    </Modal>
  );
}