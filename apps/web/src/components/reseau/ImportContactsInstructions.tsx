'use client';
import { Card } from '@/components/ui';
import { FileText, Download, Upload, Image } from 'lucide-react';
export default function ImportContactsInstructions() {
  return (
    <Card variant="glass" className="p-6 border border-gray-800 hover-lift">
      {' '}
      <h3 className="text-lg font-semibold mb-4">Instructions d'import</h3>{' '}
      <div className="space-y-4">
        {' '}
        <div className="flex items-start gap-3">
          {' '}
          <FileText className="w-5 h-5 text-blue-400 mt-0.5" />{' '}
          <div>
            {' '}
            <h4 className="font-medium mb-1">Format Excel</h4>{' '}
            <p className="text-sm text-gray-400">
              {' '}
              Téléchargez le modèle Excel et remplissez les colonnes requises.{' '}
            </p>{' '}
          </div>{' '}
        </div>{' '}
        <div className="flex items-start gap-3">
          {' '}
          <Download className="w-5 h-5 text-blue-400 mt-0.5" />{' '}
          <div>
            {' '}
            <h4 className="font-medium mb-1">Télécharger le modèle</h4>{' '}
            <p className="text-sm text-gray-400">
              {' '}
              Utilisez le modèle fourni pour garantir le bon format des données.{' '}
            </p>{' '}
          </div>{' '}
        </div>{' '}
        <div className="flex items-start gap-3">
          {' '}
          <Upload className="w-5 h-5 text-blue-400 mt-0.5" />{' '}
          <div>
            {' '}
            <h4 className="font-medium mb-1">Import ZIP</h4>{' '}
            <p className="text-sm text-gray-400">
              {' '}
              Pour inclure des photos, créez un fichier ZIP contenant l'Excel et un dossier de
              photos.{' '}
            </p>{' '}
          </div>{' '}
        </div>{' '}
        <div className="flex items-start gap-3">
          {' '}
          <Image className="w-5 h-5 text-blue-400 mt-0.5" />{' '}
          <div>
            {' '}
            <h4 className="font-medium mb-1">Photos</h4>{' '}
            <p className="text-sm text-gray-400">
              {' '}
              Les photos doivent être nommées avec le prénom et nom du contact
              (ex:"Jean_Dupont.jpg").{' '}
            </p>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </Card>
  );
}
