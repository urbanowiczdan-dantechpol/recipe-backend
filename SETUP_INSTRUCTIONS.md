# 🎯 INSTRUKCJE INSTALACJI - Krok po kroku

## 📦 Co masz w folderze `backend/`

Folder `backend/` zawiera **kompletny, gotowy do użycia** projekt backendu Next.js.

**NIE MUSISZ** kopiować kodu z `BACKEND_EXAMPLES.md` - wszystko jest już tutaj! 🎉

---

## 🚀 INSTALACJA W 5 KROKACH

### KROK 1: Pobierz folder backend

Masz dwie opcje:

**Opcja A: Jeśli używasz Publish tab**
1. Opublikuj projekt
2. Pobierz ZIP ze strony
3. Wypakuj
4. Znajdź folder `backend/`

**Opcja B: Jeśli masz lokalnie**
1. Folder `backend/` jest już w projekcie
2. Skopiuj go do osobnej lokalizacji (np. Desktop)

---

### KROK 2: Otwórz terminal w folderze backend

**Windows:**
```
1. Otwórz folder backend w Eksploratorze
2. Kliknij w pasek adresu (góra okna)
3. Wpisz: cmd
4. Enter
```

**Mac/Linux:**
```
1. Otwórz Terminal
2. cd /ścieżka/do/backend
```

**Lub w VS Code:**
```
1. File → Open Folder → wybierz backend
2. Terminal → New Terminal (Ctrl+`)
```

---

### KROK 3: Zainstaluj zależności

W terminalu (w folderze backend):

```bash
npm install
```

To zainstaluje wszystkie potrzebne pakiety:
- Next.js (framework)
- OpenAI (AI API)
- Cheerio (web scraping)
- Axios (HTTP client)
- TypeScript

**Poczekaj ~2-5 minut** aż się zainstaluje.

---

### KROK 4: Skonfiguruj OpenAI API Key

#### 4a. Zdobądź klucz OpenAI:

1. Idź do: **https://platform.openai.com/api-keys**
2. Zaloguj się (lub zarejestruj nowe konto)
3. Kliknij **"Create new secret key"**
4. Skopiuj klucz (zaczyna się od `sk-...`)
   - ⚠️ **WAŻNE:** Klucz pokazuje się tylko raz! Skopiuj go teraz!

#### 4b. Stwórz plik `.env.local`:

**Windows (Notatnik):**
```
1. Otwórz Notatnik
2. Wklej (zamień sk-xxx na swój klucz):

OPENAI_API_KEY=sk-your-key-here
NODE_ENV=development

3. Zapisz jako: backend/.env.local
4. "Save as type" → All Files
5. Encoding → UTF-8
```

**Mac/Linux (Terminal):**
```bash
# W folderze backend/
cp .env.local.example .env.local
nano .env.local
# Zamień sk-your-key-here na swój klucz
# Ctrl+X, Y, Enter (zapisz)
```

**VS Code:**
```
1. W folderze backend kliknij prawym → New File
2. Nazwij: .env.local
3. Wklej:

OPENAI_API_KEY=sk-twój-prawdziwy-klucz-tutaj
NODE_ENV=development

4. Ctrl+S (zapisz)
```

---

### KROK 5: Uruchom backend!

W terminalu (w folderze backend):

```bash
npm run dev
```

Zobaczysz:
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Ready in 2.1s
```

**Backend działa!** 🎉

---

## ✅ TEST - Czy działa?

### Test 1: Health Check

Otwórz przeglądarkę i wejdź na:
```
http://localhost:3000/api/health
```

Powinieneś zobaczyć:
```json
{
  "status": "healthy",
  "service": "recipe-unifier-backend",
  "openai_configured": true
}
```

✅ **Działa!**

---

### Test 2: Parse Recipe

W nowej karcie terminala (lub Postman):

```bash
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://www.kwestiasmaku.com/przepis/nalesniki\"}"
```

**Windows (PowerShell):**
```powershell
$body = @{url="https://www.kwestiasmaku.com/przepis/nalesniki"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/parse -Method Post -Body $body -ContentType "application/json"
```

Poczekaj 10-20 sekund...

Powinieneś dostać przepis w JSON! 🎉

---

## 🌐 DEPLOY NA VERCEL (Production)

### KROK 1: Zainstaluj Vercel CLI

```bash
npm install -g vercel
```

### KROK 2: Login

```bash
vercel login
```

Wybierz metodę (GitHub / Email).

### KROK 3: Deploy

W folderze backend:

```bash
vercel
```

Odpowiedz na pytania:
- **Set up and deploy?** → Y (Yes)
- **Which scope?** → Twoje konto
- **Link to existing project?** → N (No)
- **Project name?** → `recipe-backend` (lub inna nazwa)
- **Directory?** → `.` (enter)
- **Override settings?** → N (No)

Poczekaj ~1-2 minuty...

Otrzymasz URL: `https://recipe-backend-xxx.vercel.app` 🎉

### KROK 4: Dodaj API Key w Vercel

```
1. Idź do: https://vercel.com/dashboard
2. Wybierz projekt: recipe-backend
3. Settings → Environment Variables
4. Add New:
   - Name: OPENAI_API_KEY
   - Value: sk-twój-klucz
   - Environments: ✅ Production, ✅ Preview, ✅ Development
5. Save
```

### KROK 5: Redeploy

```bash
vercel --prod
```

Backend jest LIVE! 🚀

Test:
```bash
curl https://recipe-backend-xxx.vercel.app/api/health
```

---

## 🔗 POŁĄCZ Z FRONTENDEM

### W projekcie frontendowym:

Edytuj plik: `js/config.js`

```javascript
const CONFIG = {
    // Zamień to na URL swojego backendu:
    BACKEND_URL: 'https://recipe-backend-xxx.vercel.app',
    
    // Reszta bez zmian...
};
```

Zapisz i redeploy frontend (Publish tab).

---

## 🎊 GOTOWE!

**Masz teraz:**
- ✅ Backend lokalnie (localhost:3000)
- ✅ Backend na produkcji (Vercel)
- ✅ Frontend połączony z backendem
- ✅ Pełna aplikacja działa! 🍳

---

## 🐛 Problemy?

### "npm: command not found"
→ Zainstaluj Node.js: https://nodejs.org/

### "Port 3000 already in use"
→ Zabij proces lub użyj innego portu:
```bash
npm run dev -- -p 3001
```

### "OpenAI API error"
→ Sprawdź czy `.env.local` ma poprawny klucz
```bash
cat .env.local  # Mac/Linux
type .env.local # Windows
```

### "Module not found"
→ Przeinstaluj:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Dalsze pytania?
→ Zobacz `FAQ.md` w projekcie frontendowym

---

**Happy coding!** 🚀
