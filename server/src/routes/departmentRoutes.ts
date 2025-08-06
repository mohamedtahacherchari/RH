// server/src/routes/departmentRoutes.ts
import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware';
import Department from '../models/Department';

const router = express.Router();

router.use(verifyToken);

// Créer un département
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    
    res.status(201).json({
      success: true,
      message: 'Département créé avec succès',
      data: department
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Obtenir tous les départements
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('chef', 'nom prenom matricule')
      .sort({ nom: 1 });
    
    res.json({
      success: true,
      data: departments,
      count: departments.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mettre à jour un département
router.put('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('chef', 'nom prenom matricule');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Département non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Département mis à jour avec succès',
      data: department
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Supprimer un département
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Département non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Département supprimé avec succès'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;