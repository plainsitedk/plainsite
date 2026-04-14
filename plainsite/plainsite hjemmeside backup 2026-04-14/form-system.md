# Plainsite Form System

## Hvordan det virker

Kontaktformularen på plainsite.dk sender ikke data til en tredjepart som Formspree. I stedet kører vi vores eget system på Cloudflare Workers + Resend.

**Flowet:**
1. Besøgende udfylder formularen og trykker Send
2. Browseren sender en POST til vores Cloudflare Worker
3. Workeren slår tokenet op i Cloudflare KV og finder modtagerens email
4. Workeren sender en pænt formateret mail via Resend
5. Ingen data gemmes nogensinde — GDPR-venligt

## Komponenter

### Cloudflare Worker
- Placering: `/Users/tobias/Desktop/plainsite/plainsite-forms/worker.js`
- Deployed på: `https://plainsite-forms.tobias-gutkin.workers.dev`
- Konfiguration: `wrangler.toml` (KV namespace ID: `dc774d98c2804e029fe53a67b059cdf6`)

### Cloudflare KV (FORM_TOKENS)
- Gemmer token → email-adresse mappings
- Ingen persondata — kun routing-info
- Workerens `env.FORM_TOKENS` binding hedder `FORM_TOKENS`

### Resend
- Bruges til at sende mails
- Fra-adresse: `forms@plainsite.dk`
- API-nøgle er gemt som Cloudflare Worker secret (`RESEND_API_KEY`)
- Gratis plan: 3.000 mails/måned

### index.html (formularen)
- `action` peger på Worker-URL'en
- Skjult felt `<input type="hidden" name="_token" value="plainsite-main">` fortæller workeren hvem mailen skal til
- Felter der starter med `_` ignoreres i mailen

## Token-system

Hvert token i KV mapper til én email-adresse:
- `plainsite-main` → `kontakt@plainsite.dk`

Når du laver en hjemmeside til en kunde tilføjer du et nyt token:
```bash
wrangler kv key put --binding=FORM_TOKENS "kunde-navn" "kunde@email.dk" --remote
```

Og sætter `value="kunde-navn"` i det skjulte token-felt på kundens hjemmeside.

## Nyttige kommandoer

```bash
# Deploy workeren efter ændringer
cd /Users/tobias/Desktop/plainsite/plainsite-forms
wrangler deploy

# Opdater Resend API-nøgle
wrangler secret put RESEND_API_KEY

# Tilføj token til ny kunde
wrangler kv key put --binding=FORM_TOKENS "TOKEN-NAVN" "email@kunde.dk" --remote

# List alle tokens
wrangler kv key list --binding=FORM_TOKENS --remote

# Test formularen direkte
curl -s -X POST https://plainsite-forms.tobias-gutkin.workers.dev \
  -F "_token=plainsite-main" \
  -F "name=Test" \
  -F "email=test@test.dk" \
  -F "message=Test besked"
```
