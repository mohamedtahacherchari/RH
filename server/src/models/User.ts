export {}
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  genre: { type: String, trim: true },
  couverture: { type: String, trim: true },
  dateNaissance: { type: String, trim: true },
  regimeSocial: { type: String, trim: true },
  codePostal: { type: String, trim: true },
  googleId: { type: String },
  selectedCode: { type: String },
  dateDebutAssurance: { type: String, trim: true },
  typeCouverture: { type: String, trim: true },
  isVerified: { type: Boolean, default: false },
  nom: { type: String, trim: true },
  prenom: { type: String, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  telephone: { type: String, trim: true },
  niveauRemboursement: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
