import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface EditCagnotteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, goal: number) => void; // Plus besoin de currency
  currentName: string;
  currentGoal: number;
}

export function EditCagnotteDialog({
  open,
  onClose,
  onSave,
  currentName,
  currentGoal,
}: EditCagnotteDialogProps) {
  const [name, setName] = useState(currentName);
  const [goal, setGoal] = useState(currentGoal.toString());

  useEffect(() => {
    setName(currentName);
    setGoal(currentGoal.toString());
  }, [currentName, currentGoal, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && parseFloat(goal) > 0) {
      onSave(name.trim(), parseFloat(goal));
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Modifier la cagnotte">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name" className="text-slate-700">Nom</Label>
          <Input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-slate-200 focus:ring-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-goal" className="text-slate-700">Objectif (GNF)</Label>
          <Input
            id="edit-goal"
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
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
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}