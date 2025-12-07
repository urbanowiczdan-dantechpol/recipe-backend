# 🚀 ONE-CLICK DEPLOY - Recipe Unifier Backend

## ⚡ Najłatwiejszy sposób wdrożenia backendu (5 minut)

---

## 📋 PRZED ROZPOCZĘCIEM

### Potrzebujesz:
1. ✅ Konto GitHub (darmowe) - https://github.com/signup
2. ✅ Klucz OpenAI API - https://platform.openai.com/api-keys

**WAŻNE:** Przygotuj klucz OpenAI (zaczyna się od `sk-...`) - będzie potrzebny w kroku 4.

---

## 🎯 METODA 1: Deploy przez Vercel Dashboard (NAJŁATWIEJSZA)

### Krok 1: Przygotuj kod

**Opcja A: Jeśli masz folder `backend/` lokalnie**
```bash
# Sprawdź czy masz wszystkie pliki:
ls backend/
# Powinno być: app/, lib/, package.json, etc.
```

**Opcja B: Jeśli nie masz folderu lokalnie**
```bash
# Stwórz projekt według SETUP_INSTRUCTIONS.md
# Lub pobierz z tego projektu
```

### Krok 2: Połącz z GitHub

```bash
# W folderze backend/
git init
git add .
git commit -m "Initial commit"

# Stwórz nowe repo na GitHub:
# 1. Idź do: https://github.com/new
# 2. Nazwa: recipe-backend
# 3. Public lub Private
# 4. Nie zaznaczaj README/gitignore
# 5. Create repository

# Podłącz i wypchnij:
git remote add origin https://github.com/TWOJA-NAZWA/recipe-backend.git
git branch -M main
git push -u origin main
```

### Krok 3: Import do Vercel

```
1. Idź do: https://vercel.com/new
2. Zaloguj się przez GitHub
3. Import Git Repository
4. Wybierz: recipe-backend
5. Framework Preset: Next.js (auto-detect)
6. Root Directory: ./
7. Kliknij: Deploy

POCZEKAJ - jeszcze nie deployuj! Przejdź do Kroku 4!
```

### Krok 4: Dodaj zmienne środowiskowe

**PRZED kliknięciem Deploy:**

```
1. W sekcji "Environment Variables"
2. Dodaj:
   Name: OPENAI_API_KEY
   Value: sk-your-openai-key-here (TWÓJ KLUCZ!)
3. Environment: Production ✅ Preview ✅ Development ✅
4. Kliknij: Add
```

### Krok 5: Deploy!

```
Kliknij: Deploy

Poczekaj 1-2 minuty...

✅ Success! Twój backend jest LIVE!
```

### Krok 6: Skopiuj URL

```
Otrzymasz URL typu:
https://recipe-backend-xyz123.vercel.app

SKOPIUJ GO! Będzie potrzebny do frontendu.
```

### Krok 7: Test

Otwórz w przeglądarce:
```
https://recipe-backend-xyz123.vercel.app/api/health
```

Powinieneś zobaczyć:
```json
{
  "status": "healthy",
  "service": "recipe-unifier-backend",
  "openai_configured": true
}
```

✅ **DZIAŁA!**

---

## 🎯 METODA 2: Deploy przez CLI (dla zaawansowanych)

```bash
# 1. Zainstaluj Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. W folderze backend/
vercel

# 4. Odpowiedz na pytania:
# - Set up and deploy? Y
# - Which scope? (Twoje konto)
# - Link to existing project? N
# - Project name? recipe-backend
# - Directory? .
# - Override settings? N

# 5. Dodaj klucz API w dashboard:
# https://vercel.com/dashboard
# Projekt → Settings → Environment Variables
# Add: OPENAI_API_KEY = sk-your-key

# 6. Redeploy z kluczem
vercel --prod
```

---

## 🎯 METODA 3: Deploy przez Railway (alternatywa)

### Krok 1: Stwórz konto Railway
```
https://railway.app/
Login przez GitHub
```

### Krok 2: New Project
```
1. Dashboard → New Project
2. Deploy from GitHub repo
3. Wybierz: recipe-backend
4. Deploy Now
```

### Krok 3: Dodaj zmienne
```
1. Settings → Variables
2. Add Variable:
   OPENAI_API_KEY = sk-your-key
3. Redeploy
```

### Krok 4: Skopiuj URL
```
Settings → Domains → Generate Domain
Skopiuj URL (np. recipe-backend.up.railway.app)
```

---

## 🔗 POŁĄCZ Z FRONTENDEM

### Po wdrożeniu backendu:

**Edytuj plik:** `js/config.js` w projekcie frontendowym

```javascript
const CONFIG = {
    // Zamień to na URL swojego backendu:
    BACKEND_URL: 'https://recipe-backend-xyz123.vercel.app',
    
    // Reszta bez zmian...
};
```

### Opublikuj zaktualizowany frontend:
- Jeśli Vercel: `git push` (auto-deploy)
- Jeśli Publish tab: opublikuj ponownie
- Jeśli ręcznie: zastąp plik config.js

### Wyczyść cache:
```
Otwórz stronę: https://keoyyevn.gensparkspace.com/
Naciśnij: Ctrl+Shift+R (hard refresh)
```

---

## ✅ FINALNA WERYFIKACJA

### Test 1: Backend Health
```
https://twoj-backend.vercel.app/api/health
→ Powinno zwrócić: "status": "healthy"
```

### Test 2: Parse Recipe
```bash
curl -X POST https://twoj-backend.vercel.app/api/parse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.kwestiasmaku.com/przepis/nalesniki"}'

→ Powinno zwrócić przepis w JSON
```

### Test 3: Frontend Integration
```
1. Otwórz: https://keoyyevn.gensparkspace.com/
2. Kliknij: Dodaj przepis
3. Wklej URL: https://www.kwestiasmaku.com/przepis/nalesniki
4. Kliknij: Przetwórz przepis
5. Czekaj 10-20s
→ Powinien wyświetlić przepis!
```

---

## 🐛 TROUBLESHOOTING

### "Deployment failed"
```
Sprawdź:
- Czy wszystkie pliki są w repo?
- Czy package.json ma wszystkie zależności?
- Logs w Vercel Dashboard
```

### "OpenAI API error"
```
Sprawdź:
- Czy OPENAI_API_KEY jest dodany w Variables?
- Czy klucz zaczyna się od "sk-"?
- Czy masz saldo na koncie OpenAI?
```

### "CORS error"
```
- Backend już ma CORS skonfigurowany (Access-Control-Allow-Origin: *)
- Sprawdź czy URL backendu jest poprawny w config.js
```

### "Backend unavailable"
```
- Sprawdź czy backend jest live (health endpoint)
- Sprawdź DevTools Console (F12) dla błędów
- Sprawdź czy URL w config.js jest poprawny
```

---

## 💰 KOSZTY

### Vercel:
- **Hobby plan:** $0/miesiąc
- 100GB bandwidth
- 100 serverless function executions/day

### Railway:
- **Free plan:** $5 credit/miesiąc
- Po wykorzystaniu → $0.000463/GB-hour

### OpenAI:
- **GPT-4o-mini:** ~$0.15 per 1M tokens
- 1 przepis ≈ $0.001 (< 1 cent)
- 100 przepisów ≈ $0.10

**Total: $0-5/miesiąc** dla osobistego użytku ✅

---

## 🎊 GOTOWE!

Po wykonaniu tych kroków masz:
- ✅ Backend deployed i działający
- ✅ Frontend połączony z backendem
- ✅ Pełna aplikacja LIVE!

**Happy cooking!** 🍳✨

---

## 📞 Dalsze pytania?

Zobacz:
- `README.md` - główna dokumentacja
- `FAQ.md` - najczęstsze problemy
- `SETUP_INSTRUCTIONS.md` - setup lokalny

**Deployment documentation version:** 1.0.0
