export interface Epargne {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  // Aligné avec le backend: inclut "Urgence", accents corrigés, et "Général"
  category:
    | 'Urgence'
    | 'Hopital'
    | 'Vacances'
    | 'Maison'
    | 'Voiture'
    | 'Éducation'
    | 'Retraite'
    | 'Général'
    | 'Autre'
    | string;
}