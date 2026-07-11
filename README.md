# Kronekontroll

Norsk B2C-tjeneste (49 kr/mnd) som hjelper privatpersoner å bruke pengene riktig:
se hvor det lekker, stoppe gjeld i tide, og nå sparemål. Bygget som helautomatisert
SaaS med backoffice på én person + AI.

**Juridisk ramme:** Kronekontroll er programvare og verktøy, ikke gjeldsmegler eller
finansrådgiver. Tjenesten forhandler aldri på vegne av brukeren - alle e-poster sendes
av brukeren selv.

## Arkitektur

| Lag | Teknologi |
|---|---|
| App | Next.js (App Router) + TypeScript + Tailwind v4 |
| Database/Auth/Filer | Supabase (EU) - Postgres med Row Level Security, Auth, privat Storage |
| Betaling | Stripe (Checkout + Customer Portal + webhooks) |
| E-post ut | Resend (`varsel@kronekontroll.no`) |
| AI | Claude API (`claude-opus-4-8`) - dokumenttolkning og e-postutkast med strukturert output (Zod) |
| Hosting | Vercel, region `arn1` (Stockholm), cron for daglige varsler |

### Sikkerhetsmodellen (null datasmitte)

1. **RLS på alle tabeller** (`supabase/migrations/0001_init.sql`) - isolasjonen ligger i
   databaselaget. Kolonnenivå-grants hindrer at brukere endrer abonnementsfelt/admin-flagg.
2. **Storage-policies**: filer ligger i `dokumenter/{user_id}/…`, kun eieren når dem.
   Nedlasting via signerte URL-er med kort levetid.
3. **Service role kun i signaturverifiserte kontekster**: Stripe-webhook (signatur),
   cron (`CRON_SECRET`), GDPR-sletting (autentisert bruker + bekreftelsestekst).
4. **Ingen persondata i logger**, ingen delte cacher for brukerdata
   (`Cache-Control: private, no-store` på beskyttede ruter), strenge sikkerhetsheadere
   i `next.config.ts`.
5. **AI-kall**: ett dokument fra én bruker per kall, fødselsnummer maskeres, innhold
   logges aldri. Anthropic trener ikke på API-data.
6. **Isolasjonstester** (`tests/isolasjon.test.ts`): 44 tester der bruker B forsøker å
   lese/endre/slette/skrive bruker As data i alle tabeller og Storage. **Skal kjøres
   grønt i CI før hver deploy.**

Admin har med vilje ingen tilgang til brukernes dokumenter/transaksjoner - det finnes
ingen RLS-policy som åpner for det.

## Lokal kjøring

```bash
npm install
cp .env.example .env.local   # fyll inn verdiene (se kommentarene i filen)
npm run dev
```

Databaseskjema: kjør innholdet i `supabase/migrations/0001_init.sql` i Supabase
SQL Editor (eller `supabase db push` med Supabase CLI).

Gjør deg selv til admin (etter registrering):

```sql
update public.profiles set is_admin = true where email = 'din@epost.no';
```

Aktiver gjerne MFA for admin-brukeren i Supabase Auth.

## Tester

```bash
npm run test:isolasjon
```

Krever `TEST_SUPABASE_URL`, `TEST_SUPABASE_ANON_KEY` og `TEST_SUPABASE_SERVICE_ROLE_KEY`
(i `.env.test` lokalt, secrets i CI) mot et **test-prosjekt** med migrasjonene kjørt.
Uten variablene hopper testene over med tydelig advarsel - det regnes ikke som bestått.

## Deploy til Vercel

1. Push repoet til GitHub og importer i Vercel.
2. Sett alle miljøvariabler fra `.env.example` (Production).
3. `vercel.json` setter region `arn1` og cron `0 5 * * *` UTC (07:00 norsk sommertid)
   mot `/api/cron/varsler`. Vercel sender `CRON_SECRET` automatisk som Bearer-token
   når variabelen finnes.
4. Stripe: opprett produktet (49 kr/mnd, NOK), legg webhook-endepunkt
   `https://kronekontroll.no/api/stripe/webhook` med eventene
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`.
5. Resend: verifiser domenet `kronekontroll.no` (SPF + DKIM) før produksjon.
6. Supabase Auth: sett Site URL til `https://kronekontroll.no` og legg
   `https://kronekontroll.no/auth/callback` i Redirect URLs.

## LAUNCH-SJEKKLISTE

- [ ] `kronekontroll.no` registrert og DNS pekt mot Vercel
- [ ] Supabase-prosjekt i EU opprettet, migrasjon kjørt, Auth-URLer satt
- [ ] Alle env-nøkler satt i Vercel (bruk `.env.example` som fasit)
- [ ] Stripe i live-modus: produkt + pris (49 kr/mnd), webhook-URL + secret satt
- [ ] Resend: domene verifisert (SPF/DKIM), testvarsel sendt
- [ ] Vercel Cron aktiv (sjekk Deployments -> Crons etter første deploy)
- [ ] Isolasjonstestene kjørt grønt mot test-prosjektet
- [ ] Testkjøp gjennomført med Stripe-testkort i test-modus, deretter ett ekte kjøp
- [ ] Admin-bruker satt (`is_admin = true`) med MFA aktivert
- [ ] Personvern-, vilkår- og angrerettsidene lest gjennom en siste gang
- [ ] Google Search Console: verifiser domene og send inn `sitemap.xml`

## Videre utvikling (forberedt i koden)

- **Tink/open banking** (betalt "pluss"-plan): `src/lib/providers/bank.ts` har
  `BankDataProvider`-interfacet med `TinkProvider`-stub bak `ENABLE_TINK`.
  Databasen har `plan`-felt, `.env.example` har plassholder for pris-ID.
- **Sosiale medier-publisering**: `src/lib/social/publishers.ts` har adaptere per
  plattform som aktiveres ved å sette API-nøkler og implementere selve kallet.
  Innholdsstudio i admin genererer og køer innhold allerede nå.
- **Inkasso-satser**: `src/lib/config/inkasso.ts` og `src/lib/config/renter.ts` er
  konfigurasjonsfiler med kildekommentarer - oppdater ved nye satser.
