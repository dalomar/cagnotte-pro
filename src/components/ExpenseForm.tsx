import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, amount: number) => void;
}

export function ExpenseForm({ open, onClose, onSubmit }: ExpenseFormProps) {
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
    <Modal open={open} onClose={onClose} title="Ajouter une dépense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="expense-name" className="text-slate-700">Description</Label>
          <Input
            id="expense-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Achat de matériel"
            className="border-slate-200 focus:ring-red-500"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense-amount" className="text-slate-700">Montant (GNF)</Label>
          <Input
            id="expense-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex: 15000"
            min="0.01"
            step="0.01"
            className="border-slate-200 focus:ring-red-500"
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
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            Ajouter
          </Button>
        </div>
      </form>
    </Modal>
  );
}