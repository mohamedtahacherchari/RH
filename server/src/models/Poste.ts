// server/src/models/Poste.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPoste extends Document {
  titre: string;
  departement: mongoose.Types.ObjectId;
  description?: string;
  salaireBase: number;
  dateCreation: Date;
}

const PosteSchema: Schema = new Schema({
  titre: { type: String, required: true },
  departement: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  description: { type: String },
  salaireBase: { type: Number, required: true },
  dateCreation: { type: Date, default: Date.now }
});

export default mongoose.model<IPoste>('Poste', PosteSchema);