// server/src/models/Contrat.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IContrat extends Document {
  employee: mongoose.Types.ObjectId;
  type: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  dateDebut: Date;
  dateFin?: Date;
  salaire: number;
  conditions?: string;
  statut: 'actif' | 'expire' | 'resilier';
  dateCreation: Date;
}

const ContratSchema: Schema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { type: String, enum: ['CDI', 'CDD', 'Stage', 'Freelance'], required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date },
  salaire: { type: Number, required: true },
  conditions: { type: String },
  statut: { type: String, enum: ['actif', 'expire', 'resilier'], default: 'actif' },
  dateCreation: { type: Date, default: Date.now }
});

export default mongoose.model<IContrat>('Contrat', ContratSchema);