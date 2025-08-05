export {};
const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// ==========================
// Authentification Google
// ==========================

// Démarrer l'authentification Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

// Callback après authentification Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  authController.googleCallback
);

// Redirection après succès Google
router.get('/google/success', authController.googleSuccess);

// ==========================
// Vérification par email
// ==========================

// Vérification du token par URL
router.get('/verify/:token', authController.verifyEmail);

// Envoi du code de vérification par email
router.post('/send-code', authController.sendEmail);

// Vérification du code reçu par email
router.post('/verify-code', authController.verifyEmail);

// ==========================
// Gestion de session
// ==========================

// Déconnexion de l'utilisateur
router.get('/logout', authController.logout);

// Route en cas d'échec
router.get('/failure', authController.failure);

// enregister utilisateur 
router.post('/register', authController.registerUser);

// récupères  utilisateur 
router.get('/profile/:id', authController.profileUser);

// modifier  utilisateur 
router.put('/profile/:id', authController.updateUser); 

// delete  utilisateur 
router.put('/profile/:id', authController.deleteUserAndDevis); 

// récupères  utilisateur selon token
router.get('/me', verifyToken, authController.getAuthenticatedUser);

router.delete('/profile/:id', authController.deleteUserAndDevis);

module.exports = router;
