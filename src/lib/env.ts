/**
 * Typet tilgang til miljøvariabler på serversiden.
 * Kaster tydelig feil ved oppstart av ruten i stedet for undefined-feil dypt i koden.
 */
function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Mangler miljøvariabel: ${name}`);
  return v;
}

export const env = {
  supabaseUrl: () => must("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => must("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  /** Kun for webhooks/cron/GDPR-sletting. Aldri i kode som svarer på vanlige brukerforespørsler. */
  supabaseServiceRoleKey: () => must("SUPABASE_SERVICE_ROLE_KEY"),
  stripeSecretKey: () => must("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: () => must("STRIPE_WEBHOOK_SECRET"),
  stripePriceStandard: () => must("STRIPE_PRICE_ID_STANDARD"),
  resendApiKey: () => must("RESEND_API_KEY"),
  anthropicApiKey: () => must("ANTHROPIC_API_KEY"),
  cronSecret: () => must("CRON_SECRET"),
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  enableTink: () => process.env.ENABLE_TINK === "true",
};
