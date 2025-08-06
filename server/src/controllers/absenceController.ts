// server/src/controllers/absenceController.ts
import { Request, Response } from 'express';
import { AbsenceService } from '../services/absenceService';
import Absence from '../models/Absence';

export const absenceController = {
  // Enregistrer une nouvelle absence
  async enregistrerAbsence(req: Request, res: Response) {
    try {
      const absenceData = {
        ...req.body,
        creePar: req.user?.id
      };
      
      const absence = await AbsenceService.enregistrerAbsence(absenceData);
      
      res.status(201).json({
        success: true,
        message: 'Absence enregistrée avec succès',
        data: absence
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtenir toutes les absences
  async obtenirAbsences(req: Request, res: Response) {
    try {
      const { employee, type, statut, dateDebut, dateFin } = req.query;
      const filtres: any = {};
      
      if (employee) filtres.employee = employee;
      if (type) filtres.type = type;
      if (statut) filtres.statut = statut;
      
      if (dateDebut && dateFin) {
        filtres.dateAbsence = {
          $gte: new Date(dateDebut as string),
          $lte: new Date(dateFin as string)
        };
      }
      
      const absences = await Absence.find(filtres)
        .populate('employee', 'nom prenom matricule')
        .populate('creePar', 'nom prenom')
        .sort({ dateAbsence: -1 });
      
      res.json({
        success: true,
        data: absences,
        count: absences.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Approuver/Rejeter une absence
  async traiterAbsence(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { statut, commentaire } = req.body;
      
      const absence = await Absence.findByIdAndUpdate(
        id,
        { 
          statut,
          commentaire,
          traitePar: req.user?.id,
          dateTraitement: new Date()
        },
        { new: true }
      ).populate('employee', 'nom prenom matricule');
      
      if (!absence) {
        return res.status(404).json({
          success: false,
          message: 'Absence non trouvée'
        });
      }
      
      res.json({
        success: true,
        message: `Absence ${statut} avec succès`,
        data: absence
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtenir les absences d'un employé
  async obtenirAbsencesEmploye(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const { mois, annee } = req.query;
      
      const filtres: any = { employee: employeeId };
      
      if (mois && annee) {
        const dateDebut = new Date(Number(annee), Number(mois) - 1, 1);
        const dateFin = new Date(Number(annee), Number(mois), 0);
        filtres.dateAbsence = { $gte: dateDebut, $lte: dateFin };
      }
      
      const absences = await Absence.find(filtres).sort({ dateAbsence: -1 });
      const totalRetenues = await AbsenceService.calculerRetenuesMois(
        employeeId, 
        Number(mois), 
        Number(annee)
      );
      
      res.json({
        success: true,
        data: {
          absences,
          totalRetenues
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtenir les statistiques des absences
  async obtenirStatistiquesAbsences(req: Request, res: Response) {
    try {
      const totalAbsences = await Absence.countDocuments();
      const absencesParType = await Absence.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);
      const absencesParStatut = await Absence.aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } }
      ]);
      
      const absencesDuMois = await Absence.countDocuments({
        dateAbsence: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lte: new Date()
        }
      });
      
      res.json({
        success: true,
        data: {
          totalAbsences,
          absencesParType,
          absencesParStatut,
          absencesDuMois
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