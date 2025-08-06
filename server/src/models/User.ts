// server/src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: 'admin' | 'rh' | 'employe';
  dateCreation: Date;
  isActive: boolean;
}

const UserSchema: Schema = new Schema({
  matricule: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'rh', 'employe'], required: true },
  dateCreation: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model<IUser>('User', UserSchema);
/*
Prepositions IN :
1- Lieu fermé : He is in the room 
2- Période : Born in 1992
3- état ou condition : He is in trouble 
*/