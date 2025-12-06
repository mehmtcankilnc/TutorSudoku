export interface Technique {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  description: string;
  example: string;
}
