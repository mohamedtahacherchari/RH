export interface Guide {
  id: number;
  title: string;
  image: string;
  link?: string;
}

export interface Categories {
  [key: string]: Guide[];
}

export type CategoryKey = 
  | "Mutuelle santé"
  | "Contrats et droits"
  | "Remboursements spécifiques";