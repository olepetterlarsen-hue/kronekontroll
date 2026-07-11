export interface GuideSection {
  heading: string; // h2
  paragraphs: string[]; // rene tekstavsnitt, ingen markdown
  list?: string[]; // valgfri punktliste etter avsnittene
}

export interface Guide {
  slug: string;
  title: string; // SEO-tittel, maks 60 tegn
  description: string; // meta description, maks 155 tegn
  publishedAt: string; // ISO-dato
  readingMinutes: number;
  intro: string; // 2-3 setninger ingress
  sections: GuideSection[];
  cta: string; // en setning som peker mot Kronekontroll-produktet
}

export const guides: Guide[] = [
  {
    slug: "budsjett-som-faktisk-fungerer",
    title: "Slik setter du opp et budsjett som faktisk fungerer",
    description:
      "Lag et månedsbudsjett du klarer å følge. Faste og variable kostnader, 50/30/20-regelen og de vanligste feilene folk gjør.",
    publishedAt: "2026-07-11",
    readingMinutes: 6,
    intro:
      "De fleste som lager budsjett, gir opp etter noen uker. Ikke fordi de er dårlige med penger, men fordi budsjettet var laget for et liv de ikke lever. Her får du en oppskrift på et månedsbudsjett som tåler virkeligheten.",
    sections: [
      {
        heading: "Start med tallene du faktisk har, ikke tallene du ønsker deg",
        paragraphs: [
          "Det første steget er ikke å bestemme hva du skal bruke penger på. Det er å finne ut hva du faktisk bruker penger på i dag. Hent frem kontoutskriften for de siste to eller tre månedene og gå gjennom den linje for linje. Det tar en kveld, og det er den viktigste kvelden i hele prosessen.",
          "Mange hopper over dette steget fordi det føles ubehagelig. Men et budsjett bygget på gjetning er et budsjett som sprekker. Når du ser de ekte tallene, ser du også hvor pengene lekker, og da vet du hvor du skal sette inn støtet.",
        ],
      },
      {
        heading: "Skill mellom faste og variable kostnader",
        paragraphs: [
          "Faste kostnader er det som trekkes uansett: husleie eller boliglån, strøm, forsikring, barnehage, abonnementer og lån. Disse er forutsigbare og lette å planlegge, men vanskelige å endre på kort sikt.",
          "Variable kostnader er alt du styrer fra dag til dag: mat, klær, transport, uteliv, gaver og impulskjøp. Her svinger det mye, og her ligger som regel det raskeste rommet for endring.",
          "Poenget med å skille de to er enkelt. Faste kostnader forhandler du ned én gang, og så er jobben gjort. Variable kostnader krever en ramme du forholder deg til hver måned. Blander du dem sammen, mister du oversikten over begge.",
        ],
      },
      {
        heading: "Bruk 50/30/20 som utgangspunkt, ikke som fasit",
        paragraphs: [
          "En kjent tommelfingerregel sier at rundt halvparten av inntekten etter skatt går til det du må ha, omtrent tretti prosent til det du vil ha, og tjue prosent til sparing og nedbetaling av gjeld. Det kalles gjerne 50/30/20-regelen.",
          "Regelen er nyttig fordi den gir deg et startpunkt og en retning. Men den er ikke en fasit. Bor du dyrt i en storby, kan boligkostnadene alene spise mer enn halvparten. Har du mye gjeld, bør nedbetaling få større plass en periode. Det viktige er ikke at du treffer prosentene nøyaktig, men at du vet hvordan din fordeling ser ut, og at du bevisst flytter den i riktig retning over tid.",
        ],
      },
      {
        heading: "De vanligste feilene, og hvordan du unngår dem",
        paragraphs: [
          "Det er noen feil som går igjen hos nesten alle som prøver seg på budsjett for første gang. Kjenner du dem igjen på forhånd, er de mye lettere å styre unna.",
        ],
        list: [
          "Budsjettet er for stramt. Setter du null kroner til kos, sprekker det ved første kaffe. Legg inn en romslig post for småting, den betaler seg i form av et budsjett du faktisk følger.",
          "Du glemmer de ujevne utgiftene. Forsikring som trekkes årlig, bursdager, jul, bilservice og tannlege kommer hvert eneste år. Sett av litt hver måned til en egen bufferpost, så slutter de å velte budsjettet.",
          "Du har ingen buffer for det uforutsette. En liten buffer på egen konto gjør at en uventet regning ikke ender som kredittkortgjeld.",
          "Du sjekker aldri fasit. Et budsjett du lager i januar og aldri ser på igjen, er bare et dokument. Sett av ti minutter hver uke til å se om du ligger an som planlagt.",
        ],
      },
      {
        heading: "Gjør det til en vane, ikke et skippertak",
        paragraphs: [
          "Et budsjett fungerer først når det blir en rutine. Velg en fast dag, gjerne rett etter lønning, der du går gjennom forrige måned og setter rammene for neste. Juster postene etter hvert som du lærer hva som er realistisk for deg.",
          "Vær raus med deg selv de første månedene. Nesten ingen treffer på første forsøk, og en måned som sprakk er ikke et nederlag, det er informasjon. Målet er ikke et perfekt regneark. Målet er at du vet hvor pengene dine går, og at det er du som bestemmer retningen.",
        ],
      },
    ],
    cta: "Kronekontroll setter opp månedsbudsjettet for deg automatisk ut fra dine faktiske transaksjoner, og sier fra når du er i ferd med å sprekke, for 49 kroner i måneden.",
  },
  {
    slug: "inkassovarsel-hva-gjor-jeg",
    title: "Fått inkassovarsel? Dette gjør du nå",
    description:
      "Rolig, et inkassovarsel er ikke en betalingsanmerkning. Her er løpet fra purring til anmerkning, fristene, og hva du bør gjøre i dag.",
    publishedAt: "2026-07-11",
    readingMinutes: 7,
    intro:
      "Et inkassovarsel i postkassen kjennes ubehagelig, men det er ikke en katastrofe. Det er et varsel, ikke en dom, og du har fortsatt tid og rettigheter. Her får du oversikt over hva som skjer, hvilke frister som gjelder, og hva du bør gjøre med en gang.",
    sections: [
      {
        heading: "Slik ser løpet ut, steg for steg",
        paragraphs: [
          "Når en regning ikke blir betalt, følger de fleste kravene et fast løp. Først kommer gjerne en purring eller betalingspåminnelse fra den du skylder penger. Så kommer inkassovarselet, som er et formelt varsel om at saken sendes til inkasso hvis du ikke betaler innen fristen. Inkassovarselet skal gi deg en betalingsfrist på minst fjorten dager.",
          "Betaler du ikke innen fristen, går saken til inkasso, og du mottar en betalingsoppfordring fra inkassoselskapet. Også den har en frist på minst fjorten dager. Først hvis kravet fortsatt ikke gjøres opp, kan saken gå videre til rettslig inndriving, og da kan du få en betalingsanmerkning.",
          "Det viktige å ta med seg er at en betalingsanmerkning ikke kommer over natten. Det er flere steg og flere frister på veien, og på hvert steg har du mulighet til å ordne opp eller ta kontakt.",
        ],
      },
      {
        heading: "Sjekk om kravet stemmer, du kan bestride det",
        paragraphs: [
          "Før du betaler noe som helst, sjekk at kravet er riktig. Stemmer beløpet? Har du faktisk bestilt varen eller tjenesten? Har du allerede betalt? Feil skjer oftere enn du tror, både hos bedrifter og inkassoselskaper.",
          "Mener du at kravet er feil, helt eller delvis, har du rett til å bestride det. Gjør det skriftlig, gjerne på e-post, til både den opprinnelige kreditoren og inkassoselskapet, og forklar kort hvorfor du mener kravet ikke stemmer. Et krav som er reelt omtvistet, skal som hovedregel ikke drives inn gjennom vanlig inkasso før tvisten er avklart.",
          "Ta vare på all dokumentasjon: kvitteringer, e-poster, avtaler og skjermbilder. Det er din bevisbyrde i praksis, og det gjør diskusjonen mye enklere.",
        ],
      },
      {
        heading: "Gebyrer og salærer er regulert, ikke vilkårlige",
        paragraphs: [
          "Mange blir stresset av at kravet vokser med gebyrer og salærer. Da er det greit å vite at dette ikke er fritt frem. Hvor mye som kan legges på i purregebyr og inkassosalær, er regulert i inkassoforskriften, med maksimalsatser som avhenger av kravets størrelse og hvor langt saken har kommet.",
          "Satsene justeres over tid, så sjekk gjeldende nivå hos Forbrukerrådet eller i selve forskriften i stedet for å stole på gamle tall du finner i artikler og forum. Ser du gebyrer som virker urimelig høye i forhold til kravet, spør inkassoselskapet om en spesifisering av hva som er hovedkrav, renter og omkostninger. Det har du rett til å få.",
        ],
      },
      {
        heading: "Har du ikke råd til å betale alt nå? Be om en betalingsplan",
        paragraphs: [
          "Hvis kravet stemmer, men du ikke klarer å betale hele beløpet med en gang, er det nest beste å ta kontakt raskt. Inkassoselskaper er vant til å avtale nedbetalingsplaner, og de fleste vil heller ha en realistisk avtale enn en sak som låser seg.",
          "Vær ærlig om hva du faktisk klarer å betale per måned, og ikke lov mer enn du kan holde. En plan som ryker etter to måneder, svekker tilliten og kan gjøre neste runde vanskeligere. Få avtalen skriftlig, og betal alltid innen de avtalte datoene.",
          "Har du flere krav mot deg samtidig, prioriter det som truer det viktigste først: bolig, strøm og forsikring. Og husk at kommunen har gratis økonomisk rådgivning du har rett til å bruke, ofte via NAV.",
        ],
      },
      {
        heading: "Slik unngår du å havne her igjen",
        paragraphs: [
          "De fleste inkassosaker starter ikke med betalingsproblemer, men med en regning som ble borte i mengden. En e-postfaktura i feil mappe, et papirbrev i en travel uke, en avsender du ikke kjente igjen.",
          "Det beste vernet er et system som fanger opp regninger før de blir purringer: eFaktura og avtalegiro på faste regninger, en fast dag i uken der du sjekker ubetalte krav, og varsling når noe nærmer seg forfall. Da blir inkassovarselet noe du leser om, ikke noe du mottar.",
        ],
      },
    ],
    cta: "Kronekontroll overvåker regningene dine, varsler deg før forfall og flagger krav som ser feil ut, slik at purringer og inkassovarsler stoppes før de oppstår.",
  },
  {
    slug: "snoballmetoden-eller-skredmetoden",
    title: "Snøballmetoden eller skredmetoden: slik velger du",
    description:
      "To velprøvde metoder for å bli kvitt gjeld. Se hvordan de fungerer, hvem de passer for, og et konkret eksempel med tre gjeldsposter.",
    publishedAt: "2026-07-11",
    readingMinutes: 6,
    intro:
      "Har du flere lån og kreditter samtidig, er det lett å betale litt overalt uten å komme noen vei. De to mest kjente strategiene for å komme i mål heter snøballmetoden og skredmetoden. Begge fungerer, men de fungerer på hver sin måte.",
    sections: [
      {
        heading: "Felles utgangspunkt: minimum på alt, ekstra på én",
        paragraphs: [
          "Begge metodene bygger på samme grunnprinsipp. Du betaler minstebeløpet på alle gjeldspostene dine, slik at ingen av dem misligholdes. Alt du klarer å skrape sammen utover det, setter du inn på én utvalgt gjeldspost til den er helt nedbetalt.",
          "Når den første posten er borte, frigjøres beløpet du betalte på den. Det legger du oppå innbetalingen til neste post på listen. Slik vokser det månedlige angrepsbeløpet for hver post du blir kvitt, og nedbetalingen går fortere og fortere mot slutten. Forskjellen mellom metodene ligger kun i rekkefølgen du velger.",
        ],
      },
      {
        heading: "Snøballmetoden: minste gjeld først",
        paragraphs: [
          "Med snøballmetoden sorterer du gjeldspostene etter størrelse og angriper den minste først, uansett rente. Logikken er psykologisk: du får en rask seier, én kreditor mindre å forholde deg til, og en synlig følelse av fremgang.",
          "Det høres kanskje ut som en detalj, men motivasjon er ofte det som avgjør om en nedbetalingsplan overlever år to og tre. Å krysse ut en hel gjeldspost etter noen måneder gir en helt annen driv enn å se et stort tall krympe sakte.",
        ],
      },
      {
        heading: "Skredmetoden: høyeste rente først",
        paragraphs: [
          "Med skredmetoden sorterer du i stedet etter rente og angriper posten med høyest rente først, uansett størrelse. Dette er den matematisk beste strategien: hver ekstra krone gjør størst nytte der renten er høyest, og totalt betaler du mindre i rentekostnader og blir gjeldfri raskere.",
          "Ulempen er at den dyreste gjelden også kan være den største. Da kan det ta lang tid før du opplever den første seieren, og det krever mer disiplin å holde kursen når fremgangen er usynlig i hverdagen.",
        ],
      },
      {
        heading: "Et eksempel med tre gjeldsposter",
        paragraphs: [
          "Se for deg at du har tre gjeldsposter: et kredittkort med lav saldo men høy rente, et forbrukslån med middels saldo og middels rente, og et billån med høy saldo og lavest rente av de tre.",
          "Med snøballmetoden angriper du kredittkortet først fordi saldoen er minst. I akkurat dette tilfellet er du heldig: den minste gjelden er også den dyreste, så begge metodene starter samme sted. Slik er det ofte med kredittkort.",
          "Tenk deg i stedet at forbrukslånet hadde høyest rente, mens kredittkortet hadde lavest saldo. Da skiller metodene lag: snøballmetoden tar kredittkortet først for den raske seieren, mens skredmetoden går rett på forbrukslånet fordi det koster mest per måned å la stå. Skredmetoden gir lavest totalkostnad, snøballmetoden gir raskest synlig resultat. Begge ender samme sted til slutt: null i gjeld.",
        ],
      },
      {
        heading: "Slik velger du riktig metode for deg",
        paragraphs: [
          "Det finnes ikke ett riktig svar, men det finnes et riktig svar for deg. Still deg selv ett ærlig spørsmål: hva er størst risiko for at planen din ryker, at den koster litt for mye, eller at du mister motivasjonen underveis?",
        ],
        list: [
          "Velg snøballmetoden hvis du har mange små poster, har prøvd og gitt opp før, eller trenger raske seire for å holde motivasjonen oppe.",
          "Velg skredmetoden hvis renteforskjellene mellom postene er store, du er komfortabel med tall, og du klarer å stå i en plan uten synlig fremgang en stund.",
          "Vurder en mellomting: start med én rask seier på en liten post, og bytt deretter til høyeste rente først.",
          "Uansett metode: slutt å ta opp ny gjeld mens du betaler ned, ellers fyller du bassenget mens du prøver å tømme det.",
        ],
      },
    ],
    cta: "Kronekontroll samler alle gjeldspostene dine på ett sted, regner ut nedbetalingsplanen for både snøball og skred, og viser deg måned for måned at du er i rute.",
  },
  {
    slug: "si-opp-abonnementer-du-ikke-bruker",
    title: "Slik finner og sier du opp abonnementer du ikke bruker",
    description:
      "Strømmetjenester, apper og medlemskap spiser lønnen i det stille. Slik finner du alle abonnementene dine og sier dem opp riktig.",
    publishedAt: "2026-07-11",
    readingMinutes: 6,
    intro:
      "Abonnementer er designet for å bli glemt. Små månedlige trekk gjør ikke vondt hver for seg, men til sammen kan de utgjøre tusenlapper i året for tjenester du knapt bruker. Her er en konkret metode for å finne dem, vurdere dem og si dem opp.",
    sections: [
      {
        heading: "Steg 1: Gå gjennom kontoutskriften, tre måneder tilbake",
        paragraphs: [
          "Den eneste pålitelige kilden til hva du faktisk abonnerer på, er kontoutskriften og kredittkortfakturaen din. Hukommelsen din er ikke til å stole på her, det er hele forretningsmodellen til abonnementstjenestene.",
          "Gå tre måneder tilbake, ikke bare én. Noen abonnementer trekkes kvartalsvis eller årlig, og de dyreste overraskelsene ligger ofte der. Noter hvert eneste gjentakende trekk i en enkel liste: hva det er, hvor mye det koster per måned, og når du sist brukte tjenesten. Husk også trekk via app-butikkene på mobilen, de har egne abonnementsoversikter i kontoinnstillingene som er verdt en sjekk.",
        ],
      },
      {
        heading: "Steg 2: Kjenn igjen de vanlige slukene",
        paragraphs: [
          "Noen kategorier går igjen hos nesten alle. Sjekk listen din spesielt mot disse:",
        ],
        list: [
          "Strømmetjenester for film, serier og musikk du har flere av enn du rekker å bruke.",
          "Treningssenter du ikke har besøkt på måneder.",
          "Apper med månedstrekk du testet gratis og glemte å avslutte.",
          "Skylagring i flere tjenester samtidig, ofte holder det med én.",
          "Aviser og magasiner du sluttet å lese, men ikke å betale for.",
          "Spillabonnementer, donasjoner og medlemskap som var midlertidige, men ble permanente.",
          "Doble forsikringer og tilleggsdekninger du allerede har via andre avtaler.",
        ],
      },
      {
        heading: "Steg 3: Sorter i behold, forhandle eller si opp",
        paragraphs: [
          "Gå gjennom listen og gi hvert abonnement én av tre merkelapper. Behold det du bruker jevnlig og som gir deg reell verdi. Forhandle eller nedgrader det du bruker litt, mange tjenester har billigere nivåer, pausefunksjon eller tilbud til kunder som er på vei ut. Si opp resten, uten dårlig samvittighet.",
          "Er du i tvil om noe, si det opp likevel. Det verste som skjer, er at du savner tjenesten og tegner den på nytt, og da vet du at den faktisk er verdt pengene. Tvilen er som regel svaret.",
        ],
      },
      {
        heading: "Kjenn rettighetene dine: angrerett og oppsigelsesvilkår",
        paragraphs: [
          "Har du nylig tegnet et abonnement på nett eller telefon, har du som hovedregel fjorten dagers angrerett etter angrerettloven. Da kan du gå fra avtalen uten begrunnelse. Angreretten gjelder ved fjernsalg og salg utenfor fast utsalgssted, altså de fleste abonnementer du tegner hjemmefra.",
          "For eldre abonnementer gjelder oppsigelsesvilkårene i avtalen. Sjekk to ting: oppsigelsestiden, altså hvor lenge du må betale etter at du har sagt opp, og bindingstiden, om du i det hele tatt kan si opp nå. Vilkår som gjør det urimelig vanskelig å komme seg ut av en avtale, kan du klage på til Forbrukertilsynet. Og husk: en tjeneste som lot deg tegne abonnement med to klikk, skal ikke kreve et brev per post for å avslutte det.",
        ],
      },
      {
        heading: "Steg 5: Slik skriver du oppsigelsen",
        paragraphs: [
          "Si alltid opp skriftlig, så har du dokumentasjon. En kort e-post holder lenge. Skriv omtrent slik: emnefelt med ordet oppsigelse og ditt kundenummer. Så: Jeg sier med dette opp mitt abonnement med kundenummer X, med virkning fra dags dato. Bekreft skriftlig at oppsigelsen er mottatt, og oppgi siste betalingsdato. Jeg samtykker ikke til videre trekk etter opphørsdato.",
          "Ta vare på bekreftelsen, og sjekk kontoen de neste to månedene for å se at trekkene faktisk stopper. Fortsetter de, send bekreftelsen til tjenesten og krev tilbakebetaling, og kontakt banken din om å stanse trekket hvis det ikke ordner seg.",
          "Til slutt: gjør dette til en årlig rutine. Ett fast tidspunkt i året, gjerne januar, der du tar hele runden på nytt. Abonnementene kommer krypende tilbake, det er helt normalt, og en årlig storrengjøring holder dem i sjakk.",
        ],
      },
    ],
    cta: "Kronekontroll finner alle gjentakende trekk på kontoen din automatisk, viser hva de koster deg i året, og varsler deg når et nytt abonnement dukker opp eller en pris øker.",
  },
  {
    slug: "forhandle-ned-renten-pa-forbrukslan",
    title: "Slik forhandler du ned renten på forbrukslånet",
    description:
      "Renten på forbrukslån er ikke hugget i stein. Slik ber du banken om bedre rente, bruker refinansiering som pressmiddel og unngår fellene.",
    publishedAt: "2026-07-11",
    readingMinutes: 7,
    intro:
      "Mange betaler mer for forbrukslånet sitt enn de må, rett og slett fordi de aldri har spurt om noe annet. Renten du fikk da du tok opp lånet, er et utgangspunkt, ikke en fasit. En e-post og litt forarbeid kan gi resultater som merkes på kontoen hver eneste måned.",
    sections: [
      {
        heading: "Hvorfor banken faktisk kan gi deg bedre rente",
        paragraphs: [
          "Renten på et forbrukslån settes individuelt, basert på hvor stor risiko banken mener du utgjør. Den vurderingen ble gjort da du søkte. Har du siden den gang betalt punktlig, fått høyere inntekt, kvittet deg med annen gjeld eller ryddet opp i økonomien, er du en bedre kunde nå enn da, og da er det rimelig at prisen gjenspeiler det.",
          "I tillegg lever banken i konkurranse. Det koster mer å skaffe en ny kunde enn å beholde en eksisterende, og en kunde som viser at han er i ferd med å flytte lånet, blir plutselig verdt å strekke seg for. Du forhandler altså ikke om en tjeneste, du reforhandler en pris i et marked. Det er helt normal kundeadferd, og bankene er vant til det.",
        ],
      },
      {
        heading: "Gjør forarbeidet: kjenn ditt eget lån og markedet",
        paragraphs: [
          "Før du sender noe som helst, finn frem tallene dine. Du trenger nåværende nominell og effektiv rente, restgjeld, gjenværende løpetid og eventuelle gebyrer. Effektiv rente er det viktigste tallet, for der er alle kostnadene bakt inn, og det er det tallet du skal sammenligne på tvers av banker.",
          "Sjekk deretter hva andre banker tilbyr. Finansportalen, som drives av Forbrukerrådet, lar deg sammenligne lån på tvers av tilbydere. Innhent gjerne to eller tre konkrete tilbud, det er gratis og uforpliktende. Et reelt tilbud fra en konkurrent er det sterkeste kortet du kan legge på bordet i forhandlingen.",
        ],
      },
      {
        heading: "Slik skriver du e-posten til banken",
        paragraphs: [
          "Hold e-posten kort, saklig og konkret. Du skal ikke overtale, du skal legge frem fakta og et tydelig ønske. En oppbygging som fungerer:",
        ],
        list: [
          "Innledning: oppgi lånenummer og at henvendelsen gjelder rentebetingelsene på lånet.",
          "Din historikk: at du har betjent lånet punktlig, og eventuelle forbedringer i økonomien din siden lånet ble tatt opp.",
          "Markedet: at du har innhentet tilbud fra andre banker med lavere effektiv rente, gjerne med tilbudet vedlagt.",
          "Ønsket: at du ber om en konkret ny rentesats, og at du vurderer å flytte lånet dersom betingelsene ikke kan forbedres.",
          "Avslutning: be om skriftlig svar innen en rimelig frist, for eksempel to uker.",
        ],
      },
      {
        heading: "Refinansiering: det sterkeste pressmiddelet ditt",
        paragraphs: [
          "Refinansiering betyr at en annen bank innfrir lånet ditt og gir deg et nytt med bedre betingelser. Har du flere smålån og kredittkort, kan det å samle alt i ett lån gi både lavere effektiv rente og færre gebyrer, i tillegg til én oversiktlig regning i stedet for mange.",
          "Men refinansiering er ikke bare et alternativ, det er også et forhandlingskort. Når banken din vet at du har et konkret refinansieringstilbud i hånden, endres samtalen. Enten matcher de tilbudet, og du sparer penger uten å bytte bank, eller så bytter du, og sparer penger der. Begge utfall er en seier for deg.",
          "Eier du bolig med ledig sikkerhet, kan det i noen tilfeller være mulig å bake forbruksgjeld inn i boliglånet, som normalt har vesentlig lavere rente. Vær da bevisst på at kortsiktig gjeld ikke bør strekkes over for lang tid, mer om det under.",
        ],
      },
      {
        heading: "Sjekk dette før du takker ja",
        paragraphs: [
          "Et tilbud som ser bra ut i overskriften, kan være dårligere i detaljene. Før du signerer noe som helst, gå gjennom disse punktene:",
        ],
        list: [
          "Sammenlign effektiv rente, ikke nominell. Effektiv rente inkluderer gebyrer og viser den reelle kostnaden.",
          "Se på total kostnad over hele løpetiden. Lavere månedsbeløp med lengre løpetid kan bety at du betaler mer totalt.",
          "Ikke forleng løpetiden mer enn nødvendig, og be heller om samme eller kortere løpetid med lavere rente.",
          "Sjekk etableringsgebyr og termingebyr i det nye lånet, de kan spise opp gevinsten på små lån.",
          "Bekreft at det er kostnadsfritt å innfri lånet raskere enn planlagt, slik at ekstra innbetalinger faktisk lønner seg.",
          "Ved refinansiering av kredittkort: avslutt eller senk grensen på kortene etterpå, ellers risikerer du dobbelt gjeld.",
        ],
      },
      {
        heading: "Hvis banken sier nei",
        paragraphs: [
          "Et nei er ikke et endelig svar, det er et forhandlingsutspill. Spør hva som skal til for å få bedre betingelser, og be om en ny vurdering om noen måneder hvis situasjonen din bedres. Og har du et bedre tilbud fra en annen bank, bruk det: å flytte lånet er mindre jobb enn folk tror, og den nye banken håndterer som regel det praktiske.",
          "Det viktigste er at du gjør dette til en vane. Sjekk betingelsene dine mot markedet en gang i året. Renten du ikke spør om, er renten du blir sittende med.",
        ],
      },
    ],
    cta: "Kronekontroll følger med på lånene dine, sammenligner renten din mot markedet og gir deg ferdig utfylt forhandlings-epost når det er penger å hente.",
  },
];
