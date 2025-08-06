// server/src/services/absenceService.ts
import Absence, { IAbsence } from '../models/Absence';
import { SalaireCalculator } from '../utils/salaireCalculator';

export class AbsenceService {
  /**
   * Enregistre une absence et calcule automatiquement la retenue
   */
  static async enregistrerAbsence(data: {
    employee: string;
    dateAbsence: Date;
    heureDebut?: string;
    heureFin?: string;
    type: string;
    dureeMinutes: number;
    justification?: string;
    creePar: string;
  }): Promise<IAbsence> {
    try {
      // Récupérer le salaire de l'employé pour calculer la retenue
      const Employee = require('../models/Employee').default;
      const employee = await Employee.findById(data.employee);
      
      if (!employee) {
        throw new Error('Employé non trouvé');
      }
      
      const salaireHoraire = SalaireCalculator.calculerSalaireHoraire(employee.salaire);
      const retenue = SalaireCalculator.calculerRetenueAbsence(data.dureeMinutes, salaireHoraire);
      
      const absence = new Absence({
        ...data,
        retenueSalaire: retenue.montantRetenue
      });
      
      await absence.save();
      return absence;
      
    } catch (error) {
      throw new Error(`Erreur lors de l'enregistrement de l'absence: ${error}`);
    }
  }

  /**
   * Calcule le total des retenues pour un employé sur un mois
   */
  static async calculerRetenuesMois(employeeId: string, mois: number, annee: number): Promise<number> {
    try {
      const dateDebut = new Date(annee, mois - 1, 1);
      const dateFin = new Date(annee, mois, 0);
      
      const absences = await Absence.find({
        employee: employeeId,
        dateAbsence: { $gte: dateDebut, $lte: dateFin },
        statut: 'approuve'
      });
      
      return absences.reduce((total, absence) => total + absence.retenueSalaire, 0);
      
    } catch (error) {
      throw new Error(`Erreur lors du calcul des retenues: ${error}`);
    }
  }
}