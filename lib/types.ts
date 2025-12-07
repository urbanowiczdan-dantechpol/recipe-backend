export interface Ingredient {
  quantity: number | string;
  unit: string;
  name: string;
  notes?: string;
}

export interface Step {
  step_number: number;
  instruction: string;
  time_minutes?: number;
}

export interface Recipe {
  title: string;
  author?: string;
  ingredients: Ingredient[];
  steps: Step[];
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  cuisine?: string;
  language?: 'pl' | 'en';
  tags?: string[];
  image_url?: string;
  notes?: string;
}
