// server/src/models/Absence.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAbsence extends Document {
  employee: mongoose.Types.ObjectId;
  dateAbsence: Date;
  heureDebut?: string;
  heureFin?: string;
  type: 'retard' | 'absence_justifie' | 'absence_injustifie' | 'conge_maladie';
  dureeMinutes: number;
  justification?: string;
  pieceJointe?: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  retenueSalaire: number;
  creePar: mongoose.Types.ObjectId;
  dateCreation: Date;
}

const AbsenceSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  dateAbsence: { type: Date, required: true },
  heureDebut: { type: String },
  heureFin: { type: String },
  type: { 
    type: String, 
    enum: ['retard', 'absence_justifie', 'absence_injustifie', 'conge_maladie'], 
    required: true 
  },
  dureeMinutes: { type: Number, required: true },
  justification: { type: String },
  pieceJointe: { type: String },
  statut: { type: String, enum: ['en_attente', 'approuve', 'rejete'], default: 'en_attente' },
  retenueSalaire: { type: Number, default: 0 },
  creePar: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dateCreation: { type: Date, default: Date.now }
});

export default mongoose.model<IAbsence>('Absence', AbsenceSchema);