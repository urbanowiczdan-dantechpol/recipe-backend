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
  author?: string | null;
  ingredients: Ingredient[];
  steps: Step[];
  prep_time?: number | null;
  cook_time?: number | null;
  total_time?: number | null;
  servings?: number | null;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  category?: string | null;
  cuisine?: string | null;
  language?: 'pl' | 'en' | null;
  tags?: string[] | null;
  image_url?: string | null;
  notes?: string | null;
}
