# Kronekontroll - instruksjoner for AI-økter

Norsk privatøkonomi-SaaS. Les README.md for arkitektur og deploy.

## Ufravikelige regler

1. **Null datasmitte.** Hver ny tabell med brukerdata SKAL ha `user_id` + RLS-policy i
   en migrasjon under `supabase/migrations/`, og nye rader i isolasjonstestene
   (`tests/isolasjon.test.ts` - legg tabellen i `BRUKERTABELLER` + `TESTRADER`).
2. **Service role (`src/lib/supabase/admin.ts`) kun i signaturverifiserte kontekster**
   (webhook/cron/GDPR). Aldri i vanlige brukerforespørsler.
3. **Aldri persondata i logger** - ikke dokumentinnhold, beløp, kreditorer eller e-poster.
4. **Aldri lagre fødselsnummer** - masker med `maskFnr()` fra `src/lib/ai.ts`.
5. **Ingen gjeldsmegling**: tjenesten sender aldri e-post til kreditorer på vegne av
   brukeren. E-postutkast er alltid noe brukeren selv sender.
6. Alt brukervendt er norsk bokmål. Ingen tankestrek - bruk bindestrek eller komma.
7. Farger kun fra designsystemet i `src/app/globals.css` (@theme-tokens).
8. AI-kall: modell `claude-opus-4-8`, strukturert output via `client.messages.parse`
   + `zodOutputFormat`. Ett dokument fra én bruker per kall.

## Kommandoer

- `npm run dev` / `npm run build` / `npm run lint`
- `npm run test:isolasjon` (krever TEST_SUPABASE_* mot test-prosjekt)

Bygget skal alltid være grønt og isolasjonstestene skal kjøres før deploy.
