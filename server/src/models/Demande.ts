// server/src/models/Demande.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IDemande extends Document {
  employee: mongoose.Types.ObjectId;
  type: 'conge' | 'attestation_travail' | 'fiche_paie' | 'demission' | 'reclamation';
  objet: string;
  description: string;
  pieceJointe?: string;
  statut: 'en_attente' | 'en_cours' | 'approuve' | 'rejete' | 'complete';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  reponse?: string;
  traitePar?: mongoose.Types.ObjectId;
  dateTraitement?: Date;
  dateCreation: Date;
}

const DemandeSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { 
    type: String, 
    enum: ['conge', 'attestation_travail', 'fiche_paie', 'demission', 'reclamation'], 
    required: true 
  },
  objet: { type: String, required: true },
  description: { type: String, required: true },
  pieceJointe: { type: String },
  statut: { 
    type: String, 
    enum: ['en_attente', 'en_cours', 'approuve', 'rejete', 'complete'], 
    default: 'en_attente' 
  },
  priorite: { 
    type: String, 
    enum: ['basse', 'normale', 'haute', 'urgente'], 
    default: 'normale' 
  },
  reponse: { type: String },
  traitePar: { type: Schema.Types.ObjectId, ref: 'User' },
  dateTraitement: { type: Date },
  dateCreation: { type: Date, default: Date.now }
});

export default mongoose.model<IDemande>('Demande', DemandeSchema);