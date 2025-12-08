import OpenAI from 'openai';
import { Recipe } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Jesteś ekspertem kulinarnym i specjalistą od ekstrakcji przepisów kulinarnych.

ZADANIE:
Przeanalizuj podaną treść i wyekstrahuj przepis kulinarny w zunifikowanym formacie JSON.

ZASADY (BARDZO WAŻNE):
1. Używaj TYLKO informacji znajdujących się w dostarczonej treści
2. NIE WYMYŚLAJ ani NIE DODAWAJ żadnych danych, których nie ma w tekście
3. Jeśli czegoś nie ma w tekście, ustaw wartość null lub pustą tablicę []
4. Ignoruj: blogowe historie, reklamy, linki do social media, CTA, komentarze
5. Skoncentruj się wyłącznie na: tytule, składnikach, krokach, czasie, porcjach
6. Rozpoznaj język przepisu (pl lub en)
7. Składniki w formacie strukturalnym: {quantity, unit, name, notes}
8. Kroki ponumerowane z jasnymi instrukcjami
9. TYTUŁ: Jeśli nie ma wyraźnego tytułu, stwórz krótki opisowy tytuł na podstawie składników/dania
10. Bądź TOLERANCYJNY - nawet niepełne przepisy mogą być użyteczne

FORMAT SKŁADNIKÓW:
- quantity: liczba (2, 0.5, 1.5) lub tekst ("2-3", "do smaku")
- unit: "szt", "g", "ml", "łyżka", "łyżeczka", "szklanka", "kg", "l", etc.
- name: nazwa składnika (np. "jajka", "mąka", "mleko")
- notes: opcjonalne informacje (np. "w temp. pokojowej", "posiekane", "startej")

KATEGORIE:
- breakfast, lunch, dinner, dessert, snack, appetizer, soup, salad, main_course, side_dish, beverage, other

TRUDNOŚĆ:
- easy: proste, szybkie, mało składników
- medium: wymaga umiejętności, więcej kroków
- hard: zaawansowane techniki, długi czas

TAGI:
Automatycznie dodaj odpowiednie tagi na podstawie przepisu:
- "wegetariańskie", "wegańskie" - jeśli brak mięsa/nabiału
- "bezglutenowe" - jeśli brak mąki/glutenu
- "szybkie" - jeśli total_time < 30 min
- "niskokaloryczne", "wysokobiałkowe" - jeśli możesz wywnioskować
- kuchnia: "kuchnia polska", "kuchnia włoska", "kuchnia azjatycka", etc.

FORMAT ODPOWIEDZI (JSON):
{
  "title": "Pełna nazwa przepisu",
  "author": "Autor lub nazwa źródła (jeśli jest w tekście) lub null",
  "ingredients": [
    {
      "quantity": 2,
      "unit": "szt",
      "name": "jajka",
      "notes": "w temperaturze pokojowej"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "instruction": "Dokładna instrukcja krok po kroku",
      "time_minutes": 5
    }
  ],
  "prep_time": 15,
  "cook_time": 30,
  "total_time": 45,
  "servings": 4,
  "difficulty": "easy",
  "category": "dinner",
  "cuisine": "polish",
  "language": "pl",
  "tags": ["wegetariańskie", "szybkie"],
  "image_url": null,
  "notes": "Dodatkowe wskazówki lub porady (jeśli są w tekście)"
}

PAMIĘTAJ:
- Jeśli nie ma autora → author: null
- Jeśli nie ma czasu → prep_time: null lub 0
- Jeśli nie ma porcji → servings: null
- Język PL jeśli polski tekst, EN jeśli angielski
- Zwróć TYLKO poprawny JSON, bez dodatkowego tekstu`;

export async function parseRecipe(content: string, sourceUrl: string): Promise<Recipe> {
  try {
    console.log('Calling OpenAI API...');
    
    const truncatedContent = content.substring(0, 15000);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: SYSTEM_PROMPT 
        },
        { 
          role: 'user', 
          content: `Treść do przetworzenia (źródło: ${sourceUrl}):\n\n${truncatedContent}` 
        }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 2500,
    });
    
    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('OpenAI nie zwróciło odpowiedzi');
    }
    
    console.log('OpenAI response received');
    
    const recipe: Recipe = JSON.parse(responseText);
    
    if (!recipe.title || recipe.title.trim().length === 0) {
      console.warn('Brak tytułu - generuję domyślny');
      const urlParts = sourceUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
      recipe.title = lastPart
        .replace(/[_-]/g, ' ')
        .replace(/\.(html|php|aspx)/gi, '')
        .trim() || 'Przepis bez tytułu';
    }
    
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      throw new Error('Nie znaleziono składników - sprawdź czy URL zawiera przepis');
    }
    
    if (!recipe.steps || recipe.steps.length === 0) {
      throw new Error('Nie znaleziono kroków przygotowania - sprawdź czy URL zawiera przepis');
    }
    
    recipe.language = recipe.language || 'pl';
    recipe.difficulty = recipe.difficulty || 'medium';
    recipe.category = recipe.category || 'other';
    recipe.tags = Array.isArray(recipe.tags) ? recipe.tags : [];
    recipe.author = recipe.author || null;
    recipe.cuisine = recipe.cuisine || null;
    recipe.image_url = recipe.image_url || null;
    recipe.notes = recipe.notes || null;
    
    recipe.prep_time = Number(recipe.prep_time) || 0;
    recipe.cook_time = Number(recipe.cook_time) || 0;
    recipe.total_time = recipe.total_time || (recipe.prep_time + recipe.cook_time) || 0;
    recipe.servings = Number(recipe.servings) || 1;
    
    console.log(`Successfully parsed recipe: "${recipe.title}"`);
    
    return recipe;
    
  } catch (error: any) {
    console.error('OpenAI parsing error:', error);
    
    if (error instanceof SyntaxError) {
      throw new Error('Błąd parsowania odpowiedzi AI - spróbuj ponownie');
    }
    
    if (error.message?.includes('API key')) {
      throw new Error('Błąd API Key - sprawdź konfigurację backendu');
    }
    
    throw new Error(`AI parsing error: ${error.message}`);
  }
}
