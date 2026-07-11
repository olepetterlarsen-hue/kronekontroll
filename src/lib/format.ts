const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const nokEksakt = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function kr(belop: number): string {
  return nok.format(belop);
}

export function krEksakt(belop: number): string {
  return nokEksakt.format(belop);
}

export function prosent(verdi: number, desimaler = 1): string {
  return `${verdi.toLocaleString("nb-NO", { maximumFractionDigits: desimaler })} %`;
}

export function datoKort(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

export function dagerTil(iso: string | Date): number {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
