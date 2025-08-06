// server/src/utils/matriculeGenerator.ts
export class MatriculeGenerator {
    /**
     * Génère un matricule unique basé sur le département et l'année
     * Format: DEPT-YYYY-NNNN (ex: IT-2024-0001)
     */
    static async genererMatricule(nomDepartement: string): Promise<string> {
      const annee = new Date().getFullYear();
      const deptCode = nomDepartement.substring(0, 3).toUpperCase();
      
      // Ici vous devriez implémenter la logique pour récupérer le dernier numéro
      // Pour l'exemple, on utilise un numéro aléatoire
      const numero = Math.floor(Math.random() * 9999) + 1;
      const numeroFormate = numero.toString().padStart(4, '0');
      
      return `${deptCode}-${annee}-${numeroFormate}`;
    }
  
    /**
     * Génère un matricule simple numérique
     */
    static genererMatriculeSimple(): string {
      const timestamp = Date.now().toString();
      return timestamp.substring(timestamp.length - 6);
    }
  }
  