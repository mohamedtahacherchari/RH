//pour stocker les codes temporairement
export {};
const mongoose = require('mongoose');

const authCodeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // expire après 5 min
});

module.exports = mongoose.model('AuthCode', authCodeSchema);
