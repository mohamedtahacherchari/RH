// server/src/utils/passwordGenerator.ts
import crypto from 'crypto';

export class PasswordGenerator {
  /**
   * Génère un mot de passe sécurisé
   */
  static genererMotDePasse(longueur: number = 12): string {
    const minuscules = 'abcdefghijklmnopqrstuvwxyz';
    const majuscules = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const chiffres = '0123456789';
    const speciaux = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const tousCaracteres = minuscules + majuscules + chiffres + speciaux;
    
    let motDePasse = '';
    
    // Assurer au moins un caractère de chaque type
    motDePasse += minuscules[Math.floor(Math.random() * minuscules.length)];
    motDePasse += majuscules[Math.floor(Math.random() * majuscules.length)];
    motDePasse += chiffres[Math.floor(Math.random() * chiffres.length)];
    motDePasse += speciaux[Math.floor(Math.random() * speciaux.length)];
    
    // Compléter avec des caractères aléatoires
    for (let i = 4; i < longueur; i++) {
      motDePasse += tousCaracteres[Math.floor(Math.random() * tousCaracteres.length)];
    }
    
    // Mélanger les caractères
    return motDePasse.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Génère un mot de passe simple (pour demo)
   */
  static genererMotDePasseSimple(): string {
    const adjectives = ['Smart', 'Quick', 'Bright', 'Swift', 'Clear'];
    const nouns = ['Eagle', 'Tiger', 'Wolf', 'Lion', 'Bear'];
    const numbers = Math.floor(Math.random() * 99) + 10;
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adj}${noun}${numbers}`;
  }
}