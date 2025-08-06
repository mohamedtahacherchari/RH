// server/src/utils/salaireCalculator.ts
export interface RetenuePourAbsence {
    dureeMinutes: number;
    retenueMinutes: number;
    montantRetenue: number;
  }
  
  export class SalaireCalculator {
    /**
     * Calcule la retenue pour absence selon les règles:
     * 1-15 min -> 30 min de retenue
     * 16-30 min -> 45 min de retenue  
     * 31-45 min -> 60 min de retenue
     * > 45 min -> demi-journée (4h = 240 min)
     */
    static calculerRetenueAbsence(dureeMinutes: number, salaireHoraire: number): RetenuePourAbsence {
      let retenueMinutes = 0;
  
      if (dureeMinutes >= 1 && dureeMinutes <= 15) {
        retenueMinutes = 30;
      } else if (dureeMinutes >= 16 && dureeMinutes <= 30) {
        retenueMinutes = 45;
      } else if (dureeMinutes >= 31 && dureeMinutes <= 45) {
        retenueMinutes = 60;
      } else if (dureeMinutes > 45) {
        retenueMinutes = 240; // 4 heures = demi-journée
      }
  
      const montantRetenue = (retenueMinutes / 60) * salaireHoraire;
  
      return {
        dureeMinutes,
        retenueMinutes,
        montantRetenue: Math.round(montantRetenue * 100) / 100
      };
    }
  
    /**
     * Calcule le salaire net mensuel
     */
    static calculerSalaireNet(params: {
      salaireBase: number;
      prime: number;
      heuresSupplementaires: number;
      tauxHeureSupplementaire: number;
      retenueAbsences: number;
      avances: number;
      cotisations?: number;
      autresRetenues?: number;
    }): number {
      const {
        salaireBase,
        prime,
        heuresSupplementaires,
        tauxHeureSupplementaire,
        retenueAbsences,
        avances,
        cotisations = 0,
        autresRetenues = 0
      } = params;
  
      const salaireSupplementaire = heuresSupplementaires * tauxHeureSupplementaire;
      const salaireBrut = salaireBase + prime + salaireSupplementaire;
      const totalRetenues = retenueAbsences + avances + cotisations + autresRetenues;
  
      return Math.round((salaireBrut - totalRetenues) * 100) / 100;
    }
  
    /**
     * Calcule le salaire horaire basé sur 8h/jour et 22 jours ouvrables
     */
    static calculerSalaireHoraire(salaireMensuel: number): number {
      const heuresParMois = 8 * 22; // 176 heures par mois
      return Math.round((salaireMensuel / heuresParMois) * 100) / 100;
    }
  
    /**
     * Calcule les jours ouvrables entre deux dates
     */
    static calculerJoursOuvrables(dateDebut: Date, dateFin: Date): number {
      let count = 0;
      const current = new Date(dateDebut);
      
      while (current <= dateFin) {
        const dayOfWeek = current.getDay();
        // Exclure samedi (6) et dimanche (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
      
      return count;
    }
  }