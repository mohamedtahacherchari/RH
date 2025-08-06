// server/src/models/Department.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  nom: string;
  description?: string;
  chef?: mongoose.Types.ObjectId;
  dateCreation: Date;
}

const DepartmentSchema: Schema = new Schema({
  nom: { type: String, required: true, unique: true },
  description: { type: String },
  chef: { type: Schema.Types.ObjectId, ref: 'Employee' },
  dateCreation: { type: Date, default: Date.now }
});

export default mongoose.model<IDepartment>('Department', DepartmentSchema);