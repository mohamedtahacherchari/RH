// server/src/controllers/salaireController.ts
import { Request, Response } from 'express';
import Salaire from '../models/Salaire';
import Employee from '../models/Employee';
import { SalaireCalculator } from '../utils/salaireCalculator';
import { AbsenceService } from '../services/absenceService';

export const salaireController = {
  // Calculer le salaire d'un employé pour un mois
  async calculerSalaire(req: Request, res: Response) {
    try {
      const { employeeId, mois, annee } = req.body;
      
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employé non trouvé'
        });
      }
      
      // Vérifier si le salaire existe déjà
      const salaireExistant = await Salaire.findOne({
        employee: employeeId,
        mois,
        annee
      });
      
      if (salaireExistant) {
        return res.status(400).json({
          success: false,
          message: 'Le salaire pour ce mois existe déjà'
        });
      }
      
      // Calculer les retenues pour absences
      const retenueAbsences = await AbsenceService.calculerRetenuesMois(employeeId, mois, annee);
      
      // Calculer le salaire net
      const salaireNet = SalaireCalculator.calculerSalaireNet({
        salaireBase: employee.salaire,
        prime: employee.prime,
        heuresSupplementaires: req.body.heuresSupplementaires || 0,
        tauxHeureSupplementaire: req.body.tauxHeureSupplementaire || 0,
        retenueAbsences,
        avances: req.body.avances || 0,
        cotisations: req.body.cotisations || 0,
        autresRetenues: req.body.autresRetenues || 0
      });
      
      const salaire = new Salaire({
        employee: employeeId,
        mois,
        annee,
        salaireBase: employee.salaire,
        prime: employee.prime,
        heuresSupplementaires: req.body.heuresSupplementaires || 0,
        tauxHeureSupplementaire: req.body.tauxHeureSupplementaire || 0,
        retenues: {
          absences: retenueAbsences,
          avances: req.body.avances || 0,
          cotisations: req.body.cotisations || 0,
          autres: req.body.autresRetenues || 0
        },
        salaireNet,
        notes: req.body.notes
      });
      
      await salaire.save();
      
      res.status(201).json({
        success: true,
        message: 'Salaire calculé avec succès',
        data: salaire
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtenir tous les salaires
  async obtenirSalaires(req: Request, res: Response) {
    try {
      const { employee, mois, annee, statut } = req.query;
      const filtres: any = {};
      
      if (employee) filtres.employee = employee;
      if (mois) filtres.mois = Number(mois);
      if (annee) filtres.annee = Number(annee);
      if (statut) filtres.statut = statut;
      
      const salaires = await Salaire.find(filtres)
        .populate('employee', 'nom prenom matricule')
        .sort({ annee: -1, mois: -1 });
      
      res.json({
        success: true,
        data: salaires,
        count: salaires.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Valider un salaire
  async validerSalaire(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const salaire = await Salaire.findByIdAndUpdate(
        id,
        { statut: 'valide' },
        { new: true }
      ).populate('employee', 'nom prenom matricule');
      
      if (!salaire) {
        return res.status(404).json({
          success: false,
          message: 'Salaire non trouvé'
        });
      }
      
      res.json({
        success: true,
        message: 'Salaire validé avec succès',
        data: salaire
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Marquer un salaire comme payé
  async marquerPaye(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const salaire = await Salaire.findByIdAndUpdate(
        id,
        { 
          statut: 'paye',
          datePaiement: new Date()
        },
        { new: true }
      ).populate('employee', 'nom prenom matricule');
      
      if (!salaire) {
        return res.status(404).json({
          success: false,
          message: 'Salaire non trouvé'
        });
      }
      
      res.json({
        success: true,
        message: 'Salaire marqué comme payé',
        data: salaire
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Calculer automatiquement tous les salaires du mois
  async calculerSalairesMois(req: Request, res: Response) {
    try {
      const { mois, annee } = req.body;
      
      const employees = await Employee.find({ isActive: true });
      const resultats = [];
      
      for (const employee of employees) {
        // Vérifier si le salaire existe déjà
        const salaireExistant = await Salaire.findOne({
          employee: employee._id,
          mois,
          annee
        });
        
        if (salaireExistant) {
          continue;
        }
        
        // Calculer les retenues pour absences
        const retenueAbsences = await AbsenceService.calculerRetenuesMois(
          employee._id.toString(), 
          mois, 
          annee
        );
        
        // Calculer le salaire net
        const salaireNet = SalaireCalculator.calculerSalaireNet({
          salaireBase: employee.salaire,
          prime: employee.prime,
          heuresSupplementaires: 0,
          tauxHeureSupplementaire: 0,
          retenueAbsences,
          avances: 0,
          cotisations: employee.salaire * 0.1, // 10% de cotisations par défaut
          autresRetenues: 0
        });
        
        const salaire = new Salaire({
          employee: employee._id,
          mois,
          annee,
          salaireBase: employee.salaire,
          prime: employee.prime,
          heuresSupplementaires: 0,
          tauxHeureSupplementaire: 0,
          retenues: {
            absences: retenueAbsences,
            avances: 0,
            cotisations: employee.salaire * 0.1,
            autres: 0
          },
          salaireNet
        });
        
        await salaire.save();
        resultats.push({
          employee: `${employee.nom} ${employee.prenom}`,
          salaireNet
        });
      }
      
      res.json({
        success: true,
        message: `${resultats.length} salaires calculés avec succès`,
        data: resultats
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};