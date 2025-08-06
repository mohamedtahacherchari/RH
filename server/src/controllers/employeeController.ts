
// server/src/controllers/employeeController.ts
import { Request, Response } from 'express';
import { EmployeeService } from '../services/employeeService';
import Employee from '../models/Employee';
import Department from '../models/Department';
import Poste from '../models/Poste';

export const employeeController = {
  // Créer un nouvel employé
  async creerEmploye(req: Request, res: Response) {
    try {
      const result = await EmployeeService.creerEmploye(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Employé créé avec succès',
        data: {
          employee: result.employee,
          credentials: {
            email: result.user.email,
            motDePasse: result.motDePasse,
            matricule: result.user.matricule
          }
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtenir tous les employés
  async obtenirEmployes(req: Request, res: Response) {
    try {
      const { departement, poste, actif } = req.query;
      const filtres: any = {};
      
      if (departement) filtres.departement = departement;
      if (poste) filtres.poste = poste;
      if (actif !== undefined) filtres.isActive = actif === 'true';
      
      const employees = await EmployeeService.obtenirEmployes(filtres);
      
      res.json({
        success: true,
        data: employees,
        count: employees.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtenir un employé par ID
  async obtenirEmployeParId(req: Request, res: Response) {
    try {
      const employee = await Employee.findById(req.params.id)
        .populate('poste')
        .populate('departement')
        .populate('user');
        
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employé non trouvé'
        });
      }
      
      res.json({
        success: true,
        data: employee
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Mettre à jour un employé
  async mettreAJourEmploye(req: Request, res: Response) {
    try {
      const employee = await EmployeeService.mettreAJourEmploye(req.params.id, req.body);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employé non trouvé'
        });
      }
      
      res.json({
        success: true,
        message: 'Employé mis à jour avec succès',
        data: employee
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Désactiver un employé
  async desactiverEmploye(req: Request, res: Response) {
    try {
      const success = await EmployeeService.desactiverEmploye(req.params.id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Employé non trouvé'
        });
      }
      
      res.json({
        success: true,
        message: 'Employé désactivé avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtenir les statistiques des employés
  async obtenirStatistiques(req: Request, res: Response) {
    try {
      const totalEmployes = await Employee.countDocuments({ isActive: true });
      const employesParDepartement = await Employee.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$departement', count: { $sum: 1 } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'departement' } },
        { $unwind: '$departement' },
        { $project: { nom: '$departement.nom', count: 1 } }
      ]);
      
      const employesParPoste = await Employee.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$poste', count: { $sum: 1 } } },
        { $lookup: { from: 'postes', localField: '_id', foreignField: '_id', as: 'poste' } },
        { $unwind: '$poste' },
        { $project: { titre: '$poste.titre', count: 1 } }
      ]);
      
      res.json({
        success: true,
        data: {
          totalEmployes,
          employesParDepartement,
          employesParPoste
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};