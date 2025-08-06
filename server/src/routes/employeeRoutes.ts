
// server/src/routes/employeeRoutes.ts
import express from 'express';
import { employeeController } from '../controllers/employeeController';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';

const router = express.Router();

// Routes protégées pour RH et Admin
router.use(verifyToken);

// Créer un employé (RH et Admin uniquement)
router.post('/', requireRole(['rh', 'admin']), employeeController.creerEmploye);

// Obtenir tous les employés
router.get('/', employeeController.obtenirEmployes);

// Obtenir les statistiques
router.get('/statistiques', requireRole(['rh', 'admin']), employeeController.obtenirStatistiques);

// Obtenir un employé par ID
router.get('/:id', employeeController.obtenirEmployeParId);

// Mettre à jour un employé (RH et Admin uniquement)
router.put('/:id', requireRole(['rh', 'admin']), employeeController.mettreAJourEmploye);

// Désactiver un employé (RH et Admin uniquement)
router.delete('/:id', requireRole(['rh', 'admin']), employeeController.desactiverEmploye);

export default router;