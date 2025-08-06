// server/src/routes/absenceRoutes.ts
import express from 'express';
import { absenceController } from '../controllers/absenceController';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(verifyToken);

// Enregistrer une absence (RH et Admin uniquement)
router.post('/', requireRole(['rh', 'admin']), absenceController.enregistrerAbsence);

// Obtenir toutes les absences
router.get('/', absenceController.obtenirAbsences);

// Obtenir les statistiques des absences
router.get('/statistiques', requireRole(['rh', 'admin']), absenceController.obtenirStatistiquesAbsences);

// Obtenir les absences d'un employé
router.get('/employee/:employeeId', absenceController.obtenirAbsencesEmploye);

// Traiter une absence (approuver/rejeter)
router.put('/:id/traiter', requireRole(['rh', 'admin']), absenceController.traiterAbsence);

export default router;