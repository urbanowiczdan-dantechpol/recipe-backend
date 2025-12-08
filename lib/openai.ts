     1	import OpenAI from 'openai';
     2	import { Recipe } from './types';
     3	
     4	const openai = new OpenAI({
     5	  apiKey: process.env.OPENAI_API_KEY,
     6	});
     7	
     8	const SYSTEM_PROMPT = `Jesteś ekspertem kulinarnym i specjalistą od ekstrakcji przepisów kulinarnych.
     9	
    10	ZADANIE:
    11	Przeanalizuj podaną treść i wyekstrahuj przepis kulinarny w zunifikowanym formacie JSON.
    12	
    13	ZASADY (BARDZO WAŻNE):
    14	1. Używaj TYLKO informacji znajdujących się w dostarczonej treści
    15	2. NIE WYMYŚLAJ ani NIE DODAWAJ żadnych danych, których nie ma w tekście
    16	3. Jeśli czegoś nie ma w tekście, ustaw wartość null lub pustą tablicę []
    17	4. Ignoruj: blogowe historie, reklamy, linki do social media, CTA, komentarze
    18	5. Skoncentruj się wyłącznie na: tytule, składnikach, krokach, czasie, porcjach
    19	6. Rozpoznaj język przepisu (pl lub en)
    20	7. Składniki w formacie strukturalnym: {quantity, unit, name, notes}
    21	8. Kroki ponumerowane z jasnymi instrukcjami
    22	9. TYTUŁ: Jeśli nie ma wyraźnego tytułu, stwórz krótki opisowy tytuł na podstawie składników/dania
    23	10. Bądź TOLERANCYJNY - nawet niepełne przepisy mogą być użyteczne
    24	
    25	FORMAT SKŁADNIKÓW:
    26	- quantity: liczba (2, 0.5, 1.5) lub tekst ("2-3", "do smaku")
    27	- unit: "szt", "g", "ml", "łyżka", "łyżeczka", "szklanka", "kg", "l", etc.
    28	- name: nazwa składnika (np. "jajka", "mąka", "mleko")
    29	- notes: opcjonalne informacje (np. "w temp. pokojowej", "posiekane", "startej")
    30	
    31	KATEGORIE:
    32	- breakfast, lunch, dinner, dessert, snack, appetizer, soup, salad, main_course, side_dish, beverage, other
    33	
    34	TRUDNOŚĆ:
    35	- easy: proste, szybkie, mało składników
    36	- medium: wymaga umiejętności, więcej kroków
    37	- hard: zaawansowane techniki, długi czas
    38	
    39	TAGI:
    40	Automatycznie dodaj odpowiednie tagi na podstawie przepisu:
    41	- "wegetariańskie", "wegańskie" - jeśli brak mięsa/nabiału
    42	- "bezglutenowe" - jeśli brak mąki/glutenu
    43	- "szybkie" - jeśli total_time < 30 min
    44	- "niskokaloryczne", "wysokobiałkowe" - jeśli możesz wywnioskować
    45	- kuchnia: "kuchnia polska", "kuchnia włoska", "kuchnia azjatycka", etc.
    46	
    47	FORMAT ODPOWIEDZI (JSON):
    48	{
    49	  "title": "Pełna nazwa przepisu",
    50	  "author": "Autor lub nazwa źródła (jeśli jest w tekście) lub null",
    51	  "ingredients": [
    52	    {
    53	      "quantity": 2,
    54	      "unit": "szt",
    55	      "name": "jajka",
    56	      "notes": "w temperaturze pokojowej"
    57	    }
    58	  ],
    59	  "steps": [
    60	    {
    61	      "step_number": 1,
    62	      "instruction": "Dokładna instrukcja krok po kroku",
    63	      "time_minutes": 5
    64	    }
    65	  ],
    66	  "prep_time": 15,
    67	  "cook_time": 30,
    68	  "total_time": 45,
    69	  "servings": 4,
    70	  "difficulty": "easy",
    71	  "category": "dinner",
    72	  "cuisine": "polish",
    73	  "language": "pl",
    74	  "tags": ["wegetariańskie", "szybkie"],
    75	  "image_url": null,
    76	  "notes": "Dodatkowe wskazówki lub porady (jeśli są w tekście)"
    77	}
    78	
    79	PAMIĘTAJ:
    80	- Jeśli nie ma autora → author: null
    81	- Jeśli nie ma czasu → prep_time: null lub 0
    82	- Jeśli nie ma porcji → servings: null
    83	- Język PL jeśli polski tekst, EN jeśli angielski
    84	- Zwróć TYLKO poprawny JSON, bez dodatkowego tekstu`;
    85	
    86	export async function parseRecipe(content: string, sourceUrl: string): Promise<Recipe> {
    87	  try {
    88	    console.log('Calling OpenAI API...');
    89	    
    90	    // Limit content length (OpenAI has token limits)
    91	    const truncatedContent = content.substring(0, 15000);
    92	    
    93	    const completion = await openai.chat.completions.create({
    94	      model: 'gpt-4o-mini', // Lub 'gpt-4o' dla lepszej jakości
    95	      messages: [
    96	        { 
    97	          role: 'system', 
    98	          content: SYSTEM_PROMPT 
    99	        },
   100	        { 
   101	          role: 'user', 
   102	          content: `Treść do przetworzenia (źródło: ${sourceUrl}):\n\n${truncatedContent}` 
   103	        }
   104	      ],
   105	      temperature: 0.1, // Niska = mniej halucynacji, bardziej deterministyczne
   106	      response_format: { type: 'json_object' }, // Wymusza JSON
   107	      max_tokens: 2500,
   108	    });
   109	    
   110	    const responseText = completion.choices[0].message.content;
   111	    
   112	    if (!responseText) {
   113	      throw new Error('OpenAI nie zwróciło odpowiedzi');
   114	    }
   115	    
   116	    console.log('OpenAI response received');
   117	    
   118	    // Parse JSON response
   119	    const recipe: Recipe = JSON.parse(responseText);
   120	    
   121	    // Validation & Defaults (bardziej tolerancyjne)
   122	    // Tytuł - jeśli brak, wygeneruj z URL
   123	    if (!recipe.title || recipe.title.trim().length === 0) {
   124	      console.warn('Brak tytułu - generuję domyślny');
   125	      const urlParts = sourceUrl.split('/');
   126	      const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
   127	      recipe.title = lastPart
   128	        .replace(/[_-]/g, ' ')
   129	        .replace(/\.(html|php|aspx)/gi, '')
   130	        .trim() || 'Przepis bez tytułu';
   131	    }
   132	    
   133	    // Składniki - musi mieć przynajmniej 1
   134	    if (!recipe.ingredients || recipe.ingredients.length === 0) {
   135	      throw new Error('Nie znaleziono składników - sprawdź czy URL zawiera przepis');
   136	    }
   137	    
   138	    // Kroki - musi mieć przynajmniej 1
   139	    if (!recipe.steps || recipe.steps.length === 0) {
   140	      throw new Error('Nie znaleziono kroków przygotowania - sprawdź czy URL zawiera przepis');
   141	    }
   142	    
   143	    // Ensure all defaults
   144	    recipe.language = recipe.language || 'pl';
   145	    recipe.difficulty = recipe.difficulty || 'medium';
   146	    recipe.category = recipe.category || 'other';
   147	    recipe.tags = Array.isArray(recipe.tags) ? recipe.tags : [];
   148	    recipe.author = recipe.author || null;
   149	    recipe.cuisine = recipe.cuisine || null;
   150	    recipe.image_url = recipe.image_url || null;
   151	    recipe.notes = recipe.notes || null;
   152	    
   153	    // Czasy - bardziej elastyczne
   154	    recipe.prep_time = Number(recipe.prep_time) || 0;
   155	    recipe.cook_time = Number(recipe.cook_time) || 0;
   156	    recipe.total_time = recipe.total_time || (recipe.prep_time + recipe.cook_time) || 0;
   157	    recipe.servings = Number(recipe.servings) || 1;
   158	    
   159	    console.log(`Successfully parsed recipe: "${recipe.title}"`);
   160	    
   161	    return recipe;
   162	    
   163	  } catch (error: any) {
   164	    console.error('OpenAI parsing error:', error);
   165	    
   166	    if (error instanceof SyntaxError) {
   167	      throw new Error('Błąd parsowania odpowiedzi AI - spróbuj ponownie');
   168	    }
   169	    
   170	    if (error.message?.includes('API key')) {
   171	      throw new Error('Błąd API Key - sprawdź konfigurację backendu');
   172	    }
   173	    
   174	    throw new Error(`AI parsing error: ${error.message}`);
   175	  }
   176	}
   177	
