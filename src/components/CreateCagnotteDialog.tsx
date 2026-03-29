import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface CreateCagnotteDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, goal: number) => void; // Plus besoin de currency en paramètre
}

export function CreateCagnotteDialog({ open, onClose, onCreate }: CreateCagnotteDialogProps) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && parseFloat(goal) > 0) {
      onCreate(name.trim(), parseFloat(goal));
      setName('');
      setGoal('');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle cagnotte">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-name" className="text-slate-700">Nom de la cagnotte</Label>
          <Input
            id="new-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Cagnotte famille"
            className="border-slate-200 focus:ring-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-goal" className="text-slate-700">Objectif (GNF)</Label>
          <Input
            id="new-goal"
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Ex: 500000"
            min="1"
            step="1"
            className="border-slate-200 focus:ring-blue-500"
            required
          />
        </div>
        {/* Suppression du RadioGroup pour la devise */}
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
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Créer
          </Button>
        </div>
      </form>
    </Modal>
  );
}