// server/src/utils/emailGenerator.ts
export class EmailGenerator {
    /**
     * Génère un email professionnel basé sur nom et prénom
     */
    static genererEmail(nom: string, prenom: string, domaine: string = 'entreprise.com'): string {
      const nomClean = nom.toLowerCase().replace(/[^a-zA-Z]/g, '');
      const prenomClean = prenom.toLowerCase().replace(/[^a-zA-Z]/g, '');
      
      return `${prenomClean}.${nomClean}@${domaine}`;
    }
  
    /**
     * Génère plusieurs variantes d'email
     */
    static genererVariantesEmail(nom: string, prenom: string, domaine: string = 'entreprise.com'): string[] {
      const nomClean = nom.toLowerCase().replace(/[^a-zA-Z]/g, '');
      const prenomClean = prenom.toLowerCase().replace(/[^a-zA-Z]/g, '');
      
      return [
        `${prenomClean}.${nomClean}@${domaine}`,
        `${prenomClean}${nomClean}@${domaine}`,
        `${prenomClean.charAt(0)}${nomClean}@${domaine}`,
        `${prenomClean}.${nomClean.charAt(0)}@${domaine}`
      ];
    }
  }
  