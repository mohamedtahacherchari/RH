// server/src/routes/demandeRoutes.ts
import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';
import Demande from '../models/Demande';

const router = express.Router();

router.use(verifyToken);

// Créer une nouvelle demande
router.post('/', async (req, res) => {
  try {
    const demande = new Demande({
      ...req.body,
      employee: req.body.employee || req.user?.employeeId
    });
    
    await demande.save();
    
    res.status(201).json({
      success: true,
      message: 'Demande créée avec succès',
      data: demande
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Obtenir toutes les demandes
router.get('/', async (req, res) => {
  try {
    const { employee, type, statut, priorite } = req.query;
    const filtres: any = {};
    
    if (employee) filtres.employee = employee;
    if (type) filtres.type = type;
    if (statut) filtres.statut = statut;
    if (priorite) filtres.priorite = priorite;
    
    // Si l'utilisateur est un employé, ne voir que ses demandes
    if (req.user?.role === 'employe') {
      filtres.employee = req.user.employeeId;
    }
    
    const demandes = await Demande.find(filtres)
      .populate('employee', 'nom prenom matricule')
      .populate('traitePar', 'nom prenom')
      .sort({ dateCreation: -1 });
    
    res.json({
      success: true,
      data: demandes,
      count: demandes.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Traiter une demande
router.put('/:id/traiter', requireRole(['rh', 'admin']), async (req, res) => {
  try {
    const { statut, reponse } = req.body;
    
    const demande = await Demande.findByIdAndUpdate(
      req.params.id,
      {
        statut,
        reponse,
        traitePar: req.user?.id,
        dateTraitement: new Date()
      },
      { new: true }
    ).populate('employee', 'nom prenom matricule');
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Demande traitée avec succès',
      data: demande
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Obtenir les statistiques des demandes
router.get('/statistiques', requireRole(['rh', 'admin']), async (req, res) => {
  try {
    const totalDemandes = await Demande.countDocuments();
    const demandesParType = await Demande.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const demandesParStatut = await Demande.aggregate([
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);
    const demandesEnAttente = await Demande.countDocuments({ statut: 'en_attente' });
    
    res.json({
      success: true,
      data: {
        totalDemandes,
        demandesParType,
        demandesParStatut,
        demandesEnAttente
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