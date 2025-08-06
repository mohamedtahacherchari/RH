// server/src/models/Salaire.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISalaire extends Document {
  employee: mongoose.Types.ObjectId;
  mois: number;
  annee: number;
  salaireBase: number;
  prime: number;
  heuresSupplementaires: number;
  tauxHeureSupplementaire: number;
  retenues: {
    absences: number;
    avances: number;
    cotisations: number;
    autres: number;
  };
  salaireNet: number;
  statut: 'calcule' | 'valide' | 'paye';
  dateCalcul: Date;
  datePaiement?: Date;
  notes?: string;
}

const SalaireSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  mois: { type: Number, required: true, min: 1, max: 12 },
  annee: { type: Number, required: true },
  salaireBase: { type: Number, required: true },
  prime: { type: Number, default: 0 },
  heuresSupplementaires: { type: Number, default: 0 },
  tauxHeureSupplementaire: { type: Number, default: 0 },
  retenues: {
    absences: { type: Number, default: 0 },
    avances: { type: Number, default: 0 },
    cotisations: { type: Number, default: 0 },
    autres: { type: Number, default: 0 }
  },
  salaireNet: { type: Number, required: true },
  statut: { type: String, enum: ['calcule', 'valide', 'paye'], default: 'calcule' },
  dateCalcul: { type: Date, default: Date.now },
  datePaiement: { type: Date },
  notes: { type: String }
});

// Index unique pour éviter les doublons
SalaireSchema.index({ employee: 1, mois: 1, annee: 1 }, { unique: true });

export default mongoose.model<ISalaire>('Salaire', SalaireSchema);