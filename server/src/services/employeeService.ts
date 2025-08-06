// server/src/services/employeeService.ts
import Employee, { IEmployee } from '../models/Employee';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import { MatriculeGenerator } from '../utils/matriculeGenerator';
import { EmailGenerator } from '../utils/emailGenerator';
import { PasswordGenerator } from '../utils/passwordGenerator';

export interface CreateEmployeeData {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  dateNaissance: Date;
  lieuNaissance?: string;
  cin: string;
  poste: string;
  departement: string;
  dateEmbauche: Date;
  salaire: number;
  prime?: number;
  notes?: string;
}

export class EmployeeService {
  /**
   * Crée un nouvel employé avec son compte utilisateur
   */
  static async creerEmploye(data: CreateEmployeeData): Promise<{ employee: IEmployee; user: IUser; motDePasse: string }> {
    try {
      // Générer matricule
      const matricule = await MatriculeGenerator.genererMatricule(data.departement);
      
      // Générer email si non fourni
      const email = data.email || EmailGenerator.genererEmail(data.nom, data.prenom);
      
      // Générer mot de passe
      const motDePasse = PasswordGenerator.genererMotDePasseSimple();
      const motDePasseHash = await bcrypt.hash(motDePasse, 10);
      
      // Créer l'utilisateur
      const user = new User({
        matricule,
        nom: data.nom,
        prenom: data.prenom,
        email,
        password: motDePasseHash,
        role: 'employe'
      });
      
      await user.save();
      
      // Créer l'employé
      const employee = new Employee({
        matricule,
        nom: data.nom,
        prenom: data.prenom,
        email,
        telephone: data.telephone,
        adresse: data.adresse,
        dateNaissance: data.dateNaissance,
        lieuNaissance: data.lieuNaissance,
        cin: data.cin,
        poste: data.poste,
        departement: data.departement,
        dateEmbauche: data.dateEmbauche,
        salaire: data.salaire,
        prime: data.prime || 0,
        notes: data.notes,
        user: user._id
      });
      
      await employee.save();
      
      return { employee, user, motDePasse };
      
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'employé: ${error}`);
    }
  }

  /**
   * Met à jour les informations d'un employé
   */
  static async mettreAJourEmploye(id: string, data: Partial<CreateEmployeeData>): Promise<IEmployee | null> {
    try {
      const employee = await Employee.findByIdAndUpdate(id, data, { new: true })
        .populate('poste')
        .populate('departement')
        .populate('user');
        
      return employee;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error}`);
    }
  }

  /**
   * Désactive un employé (soft delete)
   */
  static async desactiverEmploye(id: string): Promise<boolean> {
    try {
      const employee = await Employee.findByIdAndUpdate(id, { isActive: false });
      if (employee) {
        await User.findByIdAndUpdate(employee.user, { isActive: false });
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Erreur lors de la désactivation: ${error}`);
    }
  }

  /**
   * Récupère tous les employés actifs
   */
  static async obtenirEmployes(filtres?: any): Promise<IEmployee[]> {
    try {
      const query = { isActive: true, ...filtres };
      const employees = await Employee.find(query)
        .populate('poste')
        .populate('departement')
        .populate('user')
        .sort({ nom: 1, prenom: 1 });
        
      return employees;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération: ${error}`);
    }
  }
}