# 🚀 Recipe Unifier Backend

Backend API dla Recipe Unifier - AI-powered recipe parser using OpenAI GPT.

## 📋 Quick Start

### 1. Instalacja zależności

```bash
npm install
```

### 2. Konfiguracja zmiennych środowiskowych

Skopiuj plik przykładowy i dodaj swój klucz OpenAI:

```bash
cp .env.local.example .env.local
```

Edytuj `.env.local` i zamień `sk-your-openai-api-key-here` na prawdziwy klucz OpenAI.

**Pobierz klucz OpenAI:**
1. Idź do: https://platform.openai.com/api-keys
2. Zaloguj się / Zarejestruj
3. Kliknij "Create new secret key"
4. Skopiuj klucz (zaczyna się od `sk-...`)
5. Wklej do `.env.local`

### 3. Uruchom serwer deweloperski

```bash
npm run dev
```

Backend będzie dostępny pod: http://localhost:3000

### 4. Test health check

Otwórz w przeglądarce:
```
http://localhost:3000/api/health
```

Lub w terminalu:
```bash
curl http://localhost:3000/api/health
```

Powinieneś zobaczyć:
```json
{
  "status": "healthy",
  "service": "recipe-unifier-backend",
  "version": "1.0.0",
  "timestamp": "2024-...",
  "openai_configured": true
}
```

### 5. Test parsowania przepisu

```bash
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.kwestiasmaku.com/przepis/nalesniki"}'
```

## 🚢 Deployment na Vercel

### Pierwszy deploy:

```bash
# 1. Zainstaluj Vercel CLI (jeśli nie masz)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel
```

### Dodaj zmienne środowiskowe w Vercel:

1. Idź do: https://vercel.com/dashboard
2. Wybierz projekt `recipe-unifier-backend`
3. Settings → Environment Variables
4. Dodaj:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-key-here`
   - Environment: Production, Preview, Development
5. Save

### Production deploy:

```bash
vercel --prod
```

Otrzymasz URL typu: `https://recipe-unifier-backend.vercel.app`

### Zaktualizuj frontend:

W projekcie frontendowym edytuj `js/config.js`:

```javascript
const CONFIG = {
    BACKEND_URL: 'https://recipe-unifier-backend.vercel.app',
    // ...
};
```

## 📁 Struktura projektu

```
backend/
├── app/
│   └── api/
│       ├── parse/
│       │   └── route.ts      # Główny endpoint parsowania
│       └── health/
│           └── route.ts      # Health check endpoint
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── scraper.ts            # Web scraping logic
│   └── openai.ts             # OpenAI integration
├── .env.local                # Zmienne środowiskowe (NIE commituj!)
├── .env.local.example        # Przykładowy plik env
├── package.json              # Zależności
├── tsconfig.json             # TypeScript config
└── next.config.js            # Next.js config
```

## 🔌 API Endpoints

### POST /api/parse

Parsuj przepis z URL.

**Request:**
```json
{
  "url": "https://example.com/recipe"
}
```

**Response (Success 200):**
```json
{
  "title": "Nazwa przepisu",
  "author": "Autor",
  "ingredients": [
    {
      "quantity": 2,
      "unit": "szt",
      "name": "jajka",
      "notes": ""
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "instruction": "Zrób coś...",
      "time_minutes": 5
    }
  ],
  "prep_time": 15,
  "cook_time": 30,
  "total_time": 45,
  "servings": 4,
  "difficulty": "easy",
  "category": "breakfast",
  "language": "pl",
  "tags": ["szybkie"],
  "_meta": {
    "processing_time_ms": 12000,
    "content_length": 5000
  }
}
```

**Response (Error 400/500):**
```json
{
  "error": "Error message here"
}
```

### GET /api/health

Sprawdź status backendu.

**Response:**
```json
{
  "status": "healthy",
  "service": "recipe-unifier-backend",
  "version": "1.0.0",
  "timestamp": "2024-12-07T12:00:00.000Z",
  "openai_configured": true
}
```

## 🐛 Troubleshooting

### "OpenAI API error"
- Sprawdź czy `OPENAI_API_KEY` jest poprawny w `.env.local`
- Sprawdź saldo na: https://platform.openai.com/usage

### "CORS error"
- CORS jest skonfigurowany na `*` (wszystkie origins)
- Jeśli problem, sprawdź czy backend zwraca header: `Access-Control-Allow-Origin: *`

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Cold start (pierwsze wywołanie wolne)
- To normalne na Vercel (serverless functions)
- Pierwsze wywołanie: ~30s
- Kolejne: ~10-15s

## 💰 Koszty

- **Vercel Hosting:** $0 (100k requests/month free)
- **OpenAI GPT-4o-mini:** ~$0.15 per 1M tokens
  - 1 przepis ≈ 5k tokens ≈ $0.0008 (< 1 cent)
  - 100 przepisów ≈ $0.08
- **OpenAI GPT-4o:** ~$2.50 per 1M tokens (10x droższy, lepsza jakość)

**Total:** $0-5/miesiąc dla osobistego użytku

## 🔒 Bezpieczeństwo

- ✅ API key w zmiennych środowiskowych (nie w kodzie)
- ✅ `.env.local` w `.gitignore` (nie commituj kluczy!)
- ✅ Rate limiting (Vercel default)
- ✅ Input validation (URL format)
- ✅ Error handling (bez exposowania stack traces w production)

## 📚 Więcej informacji

Zobacz główny README projektu frontendowego dla pełnej dokumentacji.

## 🆘 Support

Masz problem? Sprawdź:
1. `FAQ.md` w projekcie frontendowym
2. Logi Vercel Dashboard
3. Console w DevTools (F12)

---

**Zbudowane z ❤️ i OpenAI GPT**
