// server/src/routes/posteRoutes.ts
import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';
import Poste from '../models/Poste';

const router = express.Router();

router.use(verifyToken);

// Créer un poste
router.post('/', requireRole(['rh', 'admin']), async (req, res) => {
  try {
    const poste = new Poste(req.body);
    await poste.save();
    
    res.status(201).json({
      success: true,
      message: 'Poste créé avec succès',
      data: poste
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Obtenir tous les postes
router.get('/', async (req, res) => {
  try {
    const { departement } = req.query;
    const filtres: any = {};
    
    if (departement) filtres.departement = departement;
    
    const postes = await Poste.find(filtres)
      .populate('departement', 'nom')
      .sort({ titre: 1 });
    
    res.json({
      success: true,
      data: postes,
      count: postes.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mettre à jour un poste
router.put('/:id', requireRole(['rh', 'admin']), async (req, res) => {
  try {
    const poste = await Poste.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('departement', 'nom');
    
    if (!poste) {
      return res.status(404).json({
        success: false,
        message: 'Poste non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Poste mis à jour avec succès',
      data: poste
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Supprimer un poste
router.delete('/:id', requireRole(['rh', 'admin']), async (req, res) => {
  try {
    const poste = await Poste.findByIdAndDelete(req.params.id);
    
    if (!poste) {
      return res.status(404).json({
        success: false,
        message: 'Poste non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Poste supprimé avec succès'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;