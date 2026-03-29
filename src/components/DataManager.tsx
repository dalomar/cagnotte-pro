import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Download, Upload, Trash2, Database } from 'lucide-react';

interface DataManagerProps {
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  onClear: () => void;
  onShare?: () => Promise<string>;
  onGetStats?: () => Promise<{
    totalCagnottes: number;
    totalContributions: number;
    totalExpenses: number;
    dbSize: string;
  } | null>;
}

export function DataManager({ onExport, onImport, onClear, onShare, onGetStats }: DataManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<{
    totalCagnottes: number;
    totalContributions: number;
    totalExpenses: number;
    dbSize: string;
  } | null>(null);

  useEffect(() => {
    if (onGetStats) {
      onGetStats().then(setStats);
    }
  }, [onGetStats]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await onImport(file);
        alert('Données importées avec succès !');
        // Rafraîchir les statistiques après l'import
        if (onGetStats) {
          const newStats = await onGetStats();
          setStats(newStats);
        }
      } catch (error) {
        alert(`Erreur lors de l'import : ${error.message}`);
      }
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💾 Gestion des Données
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Sauvegardez vos données pour les récupérer sur un autre navigateur ou appareil.
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={onExport} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Exporter les données
          </Button>

          <Button onClick={() => onShare?.()} variant="outline" className="w-full" disabled={!onShare}>
            <Database className="w-4 h-4 mr-2" />
            Partager via lien
          </Button>

          <Button onClick={handleImportClick} variant="outline" className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Importer des données
          </Button>

          <Button onClick={onClear} variant="destructive" className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer toutes les données
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="text-xs text-gray-500">
          <strong>Note :</strong> Les données sont automatiquement sauvegardées localement,
          mais l'export vous permet de les conserver en sécurité.
        </div>
      </CardContent>
    </Card>
  );
}