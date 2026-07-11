import { ImportSenter } from "./import-senter";

export const metadata = { title: "Importer dokumenter" };

export default function ImportSide() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Importer</h1>
        <p className="mt-1 max-w-xl text-sm text-demp">
          Slipp alt her: kontoutskrifter, inkassobrev, låneavtaler og e-poster. Kronekontroll leser
          dokumentet, viser deg hva som ble funnet, og ingenting lagres i oversikten før du
          bekrefter. Fødselsnummer maskeres automatisk.
        </p>
      </div>
      <ImportSenter />
    </div>
  );
}
