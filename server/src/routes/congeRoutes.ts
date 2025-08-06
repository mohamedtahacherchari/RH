// server/src/routes/congeRoutes.ts
import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';
import Conge from '../models/Conge';
import Employee from '../models/Employee';

const router = express.Router();

router.use(verifyToken);

// Créer une demande de congé
router.post('/', async (req, res) => {
  try {
    const conge = new Conge({
      ...req.body,
      employee: req.body.employee || req.user?.employeeId
    });
    
    await conge.save();
    
    res.status(201).json({
      success: true,
      message: 'Demande de congé créée avec succès',
      data: conge
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Obtenir toutes les demandes de congé
router.get('/', async (req, res) => {
  try {
    const { employee, statut, type } = req.query;
    const filtres: any = {};
    
    if (employee) filtres.employee = employee;
    if (statut) filtres.statut = statut;
    if (type) filtres.type = type;
    
    // Si l'utilisateur est un employé, ne voir que ses congés
    if (req.user?.role === 'employe') {
      filtres.employee = req.user.employeeId;
    }
    
    const conges = await Conge.find(filtres)
      .populate('employee', 'nom prenom matricule')
      .populate('approuvePar', 'nom prenom')
      .sort({ dateCreation: -1 });
    
    res.json({
      success: true,
      data: conges,
      count: conges.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Approuver/Rejeter une demande de congé
router.put('/:id/traiter', requireRole(['rh', 'admin']), async (req, res) => {
  try {
    const { statut, commentaireRH } = req.body;
    
    const conge = await Conge.findByIdAndUpdate(
      req.params.id,
      {
        statut,
        commentaireRH,
        approuvePar: req.user?.id,
        dateApprobation: new Date()
      },
      { new: true }
    ).populate('employee', 'nom prenom matricule');
    
    if (!conge) {
      return res.status(404).json({
        success: false,
        message: 'Demande de congé non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: `Demande de congé ${statut} avec succès`,
      data: conge
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Obtenir les congés d'un employé
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { annee } = req.query;
    
    const filtres: any = { employee: employeeId };
    
    if (annee) {
      const dateDebut = new Date(Number(annee), 0, 1);
      const dateFin = new Date(Number(annee), 11, 31);
      filtres.dateDebut = { $gte: dateDebut, $lte: dateFin };
    }
    
    const conges = await Conge.find(filtres).sort({ dateDebut: -1 });
    
    // Calcul du solde de congés (30 jours par an)
    const congesApprouves = conges.filter(c => c.statut === 'approuve');
    const joursUtilises = congesApprouves.reduce((total, c) => total + c.nombreJours, 0);
    const soldeRestant = 30 - joursUtilises;
    
    res.json({
      success: true,
      data: {
        conges,
        statistiques: {
          joursUtilises,
          soldeRestant,
          totalDemandes: conges.length
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;