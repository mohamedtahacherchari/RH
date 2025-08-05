// src/features/healthSections/types/healthSection.types.ts

export type HealthSectionCategory =
  | "Mutuelle santé"
  | "Contrats et droits"
  | "Remboursements spécifiques";

  export type HealthSection = {
    id: number;
    imageSrc: string;
    imageAlt: string;
    title: string;
    description: string;
    content?: string; // facultatif
    category?: string; // facultatif
    profiles?: string[];
  };

