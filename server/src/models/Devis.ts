export {}
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  nom: { type: String },
  age: { type: Number },
  type: { type: String, enum: ['adulte', 'enfant'] }
});

const DevisSchema = new mongoose.Schema({
  members: { type: [memberSchema] },
  prixTotal: { type: Number },
  categories: { type: String, trim: true },
  codePostal: { type: String, trim: true },
  dateDebutAssurance: { type: String, trim: true  },
  typeCouverture: { type: String, trim: true },
  genre: { type: String, trim: true },
  couverture: { type: String, trim: true },
  dateNaissance: { type: String, trim: true },
  regimeSocial: { type: String, trim: true },
  googleId: { type: String },
  selectedCode: { type: Object },
  isVerified: { type: Boolean, default: false },
  nom: { type: String, trim: true },
  prenom: { type: String, trim: true },
  email: { type: String, required: true, trim: true },
  telephone: { type: String, trim: true },
  niveauRemboursement: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Devis', DevisSchema);
