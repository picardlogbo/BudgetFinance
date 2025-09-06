export interface Epargne {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'Hopital' | 'Vacances' | 'Maison' | 'Voiture' | 'Éducation' | 'Retraite' | 'General' | string;
}