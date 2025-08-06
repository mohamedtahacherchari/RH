// server/src/models/Employee.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  dateNaissance: Date;
  lieuNaissance?: string;
  cin: string;
  poste: mongoose.Types.ObjectId;
  departement: mongoose.Types.ObjectId;
  contrat: mongoose.Types.ObjectId;
  dateEmbauche: Date;
  salaire: number;
  prime: number;
  notes?: string;
  user: mongoose.Types.ObjectId;
  isActive: boolean;
}

const EmployeeSchema: Schema = new Schema({
  matricule: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String },
  adresse: { type: String },
  dateNaissance: { type: Date, required: true },
  lieuNaissance: { type: String },
  cin: { type: String, required: true, unique: true },
  poste: { type: Schema.Types.ObjectId, ref: 'Poste', required: true },
  departement: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  contrat: { type: Schema.Types.ObjectId, ref: 'Contrat' },
  dateEmbauche: { type: Date, required: true },
  salaire: { type: Number, required: true },
  prime: { type: Number, default: 0 },
  notes: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);