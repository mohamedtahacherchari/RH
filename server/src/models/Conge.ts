// server/src/models/Conge.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IConge extends Document {
  employee: mongoose.Types.ObjectId;
  type: 'annuel' | 'maladie' | 'maternite' | 'paternite' | 'exceptionnel';
  dateDebut: Date;
  dateFin: Date;
  nombreJours: number;
  motif?: string;
  pieceJointe?: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  commentaireRH?: string;
  approuvePar?: mongoose.Types.ObjectId;
  dateApprobation?: Date;
  dateCreation: Date;
}

const CongeSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { 
    type: String, 
    enum: ['annuel', 'maladie', 'maternite', 'paternite', 'exceptionnel'], 
    required: true 
  },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  nombreJours: { type: Number, required: true },
  motif: { type: String },
  pieceJointe: { type: String },
  statut: { type: String, enum: ['en_attente', 'approuve', 'rejete'], default: 'en_attente' },
  commentaireRH: { type: String },
  approuvePar: { type: Schema.Types.ObjectId, ref: 'User' },
  dateApprobation: { type: Date },
  dateCreation: { type: Date, default: Date.now }
});

export default mongoose.model<IConge>('Conge', CongeSchema);