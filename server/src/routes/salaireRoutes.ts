// server/src/routes/salaireRoutes.ts
import express from 'express';
import { salaireController } from '../controllers/salaireController';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(verifyToken);

// Calculer le salaire d'un employé (RH et Admin uniquement)
router.post('/calculer', requireRole(['rh', 'admin']), salaireController.calculerSalaire);

// Calculer tous les salaires du mois (Admin uniquement)
router.post('/calculer-mois', requireRole(['admin']), salaireController.calculerSalairesMois);

// Obtenir tous les salaires
router.get('/', salaireController.obtenirSalaires);

// Valider un salaire (RH et Admin uniquement)
router.put('/:id/valider', requireRole(['rh', 'admin']), salaireController.validerSalaire);

// Marquer un salaire comme payé (Admin uniquement)
router.put('/:id/payer', requireRole(['admin']), salaireController.marquerPaye);

export default router;