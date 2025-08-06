import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import passport from 'passport';
import mongoose from 'mongoose';
import session from 'express-session';

import authRoute from './routes/authRoute';
import devisRoutes from './routes/devisRoute';
import absenceRoutes from './routes/absenceRoutes';
import congeRoutes from './routes/congeRoutes';
import demandeRoutes from './routes/demandeRoutes';
import departmentRoutes from './routes/departmentRoutes';
import employeeRoutes from './routes/employeeRoutes';
import posteRoutes from './routes/posteRoutes';
import salaireRoutes from './routes/salaireRoutes';

const { CLIENT_ID, CLIENT_SECRET, AUTH_URL, API_URL, PORT, SESSION_SECRET, MONGODB_URI } = process.env;

// Vérification des variables critiques
if (!MONGODB_URI || !SESSION_SECRET) {
  throw new Error('Variables d\'environnement manquantes');
}

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passport (après session)
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Connexion MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err.message));

// Middleware d'authentification
const ensureAuth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Non autorisé' });
};

// Routes
app.use('/auth', authRoute);
app.use('/api/devis', devisRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/conges', congeRoutes);
app.use('/api/demandes', demandeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/postes', posteRoutes);
app.use('/api/salaires', salaireRoutes);

// Route profil
app.get('/profile', ensureAuth, (req, res) => {
  res.json({ user: req.user });
});

// Route comparaison API
app.post('/api/comparaison', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { data } = await axios.post(API_URL!, req.body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(data);
  } catch (error: any) {
    console.error('Erreur API comparaison:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Fonction token
const getAccessToken = async (): Promise<string> => {
  try {
    const { data } = await axios.post(AUTH_URL!, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return data.access_token;
  } catch (error: any) {
    console.error('Erreur obtention token:', error.response?.data || error.message);
    throw new Error("Impossible d'obtenir le token");
  }
};

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});