require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session');
const devisRoutes = require('./routes/devisRoute');

const authRoute = require('./routes/authRoute');
require('./config/passport')(passport);

const { CLIENT_ID, CLIENT_SECRET, AUTH_URL, API_URL, PORT, SESSION_SECRET, MONGODB_URI } = process.env;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connexion MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch((err: { message: any; }) => console.error('❌ Erreur MongoDB :', err.message));

// Fonction pour obtenir le token d'accès
const getAccessToken = async () => {
  try {
    const { data } = await axios.post(AUTH_URL, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return data.access_token;
  } 
  catch (error: any) {
    console.error('Erreur obtention token :', error.response?.data || error.message);
    throw new Error("Impossible d'obtenir le token");
  }
};

// Middleware de protection des routes
const ensureAuth = (req: { isAuthenticated: () => any; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): any; new(): any; }; }; }, next: () => any) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Non autorisé' });
};

// Routes principales
app.use('/auth', authRoute);
app.use('/api/devis', devisRoutes);

// Route protégée pour récupérer le profil utilisateur
app.get('/profile', ensureAuth, (req: { user: any; }, res: { json: (arg0: { user: any; }) => void; }) => {
  res.json({ user: req.user });
});

// Route pour comparaison via API externe
app.post('/api/comparaison', async (req: { body: any; }, res: { json: (arg0: any) => void; status: (arg0: any) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  try {
    const token = await getAccessToken();

    const { data } = await axios.post(API_URL, req.body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(data);
  }/* catch (error) {
    console.error('Erreur API comparaison :', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }*/
  catch (error: any) {
    console.error('Erreur API comparaison :', error.response?.data || error.message);
    throw new Error("Impossible d'obtenir le token");
  }
});

// Démarrage du serveur
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));
