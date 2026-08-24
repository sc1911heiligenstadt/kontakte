// Öffentliche Versionsnummer der App. Bleibt flottenweit auf "1.0" — gezählt wird
// im Changelog darunter, nicht hier.
const APP_VERSION = "1.0";

// Wo die Freigabe gesetzt wird: Tools-Übersicht, Tab „Mein Konto".
// ⚠️ Bis 2026-08-13 zeigte das auf Trainerdaten — dort lag die Freigabe zuerst und
// ist von dort in den Konto-Tab gezogen. Steht als Konstante hier, weil die Adresse
// an mehreren Stellen im Text auftaucht; wer sie erneut verschiebt, ändert sie hier
// und zieht die Fließtexte in index.html mit (sie nennen den Tab beim Namen).
const FREIGABE_URL = "https://sc1911heiligenstadt.github.io/ToolsUebersicht/";

const APP_CHANGELOG = [
  {
    version: "1.4",
    groups: [
      {
        title: "Suchfeld in der Mannschaftsübersicht",
        items: [
          "Über der Liste steht jetzt ein Suchfeld. Es findet Mannschaften („D2“, „Bambini“), Ligen, Jahrgänge, Namen und Rollen — und auch die freigegebenen Nummern und E-Mail-Adressen, damit sich ein Anrufer nachschlagen lässt.",
          "Wird nach einer Mannschaft gesucht, bleibt sie vollständig stehen — mit allen, die sie betreuen. Wird nach einem Namen gesucht, erscheinen die Mannschaften dieser Person, und darin nur sie: Wer „Mustermann“ eingibt, will sehen, wo Mustermann steht, nicht die Kollegen dazu.",
          "Der Knopf „Drucken“ druckt, was zu sehen ist. Wer erst nach „D“ sucht, bekommt ein Blatt nur mit den D-Mannschaften. Der Suchbegriff steht dann oben mit drauf, damit ein Blatt mit wenigen Mannschaften nicht wie die vollständige Liste aussieht."
        ]
      }
    ]
  },
  {
    version: "1.3",
    groups: [
      {
        title: "Neu: die Übersicht nach Mannschaften",
        items: [
          "Der neue Tab „Mannschaften“ zeigt, wer welche Mannschaft betreut — von der Ersten bis zu den Bambini, in der Reihenfolge, in der die Mannschaften auch sonst überall stehen.",
          "Zu jeder Mannschaft stehen Liga und Jahrgang dabei. Den Jahrgang rechnet das Werkzeug selbst aus Saison und Altersstufe aus: Bei den A-Junioren sind das in der Saison 2026/27 die Jahrgänge 2008 und 2009. Niemand muss das jede Saison neu eintragen.",
          "Wer eine Mannschaft betreut, steht hier immer mit Namen und Rolle — das gehört zur Vereinsorganisation und steht ohnehin an jedem Aushang. Telefonnummer und E-Mail-Adresse stehen weiterhin nur bei den Personen, die sie freigegeben haben.",
          "Die Anschrift wird in dieser Ansicht nie gezeigt, auch wenn sie freigegeben ist: Um den Trainer der D2 zu erreichen, genügen Nummer und E-Mail.",
          "Eine Mannschaft, bei der noch niemand eingetragen ist, bleibt in der Liste stehen und sagt das offen. So fällt auf, wenn in der Mannschaftsliste etwas fehlt.",
          "Gab es die Mannschaften schon in früheren Saisons, lässt sich oben zwischen den Saisons umschalten.",
          "Der Knopf „Drucken“ macht daraus ein Blatt fürs Schwarze Brett — mit Mannschaft, Liga, Jahrgang und den Namen, aber ohne Telefonnummern und E-Mail-Adressen. Freigegeben wurden die Angaben für die interne Liste, nicht für den Schaukasten."
        ]
      }
    ]
  },
  {
    version: "1.2",
    groups: [
      {
        title: "Ruhigere Karten",
        items: [
          "Die Knöpfe stehen jetzt gesammelt unten in der Karte statt neben jeder Zeile. Damit sieht jede Karte gleich aus — vorher rutschten sie bei einer langen E-Mail-Adresse in eine eigene Zeile und jede Karte war anders aufgebaut.",
          "Nummer und Adresse selbst bleiben weiterhin direkt antippbar.",
          "Wer nur seine Anschrift freigegeben hat, bekommt gar keine Knöpfe mehr — dort gibt es nichts zu tippen."
        ]
      }
    ]
  },
  {
    version: "1.1",
    groups: [
      {
        title: "Knöpfe zum Anrufen, für WhatsApp und für E-Mail",
        items: [
          "Neben jeder Telefonnummer steht jetzt ein Knopf „Anrufen“ — ein Tipp und das Telefon wählt.",
          "Bei Handynummern kommt ein grüner WhatsApp-Knopf dazu: Er öffnet direkt das Nachrichtenfenster mit dieser Person.",
          "Bei Festnetznummern erscheint der WhatsApp-Knopf bewusst nicht — dort gibt es kein WhatsApp, der Knopf könnte nur ins Leere führen.",
          "Neben der E-Mail-Adresse steht ein Knopf „Mail“, der das Mailprogramm mit der Adresse öffnet.",
          "Am Handy zeigen die Knöpfe nur ihr Symbol, damit die Karten schmal bleiben. Nummer und Adresse selbst lassen sich weiterhin auch direkt antippen."
        ]
      }
    ]
  },
  {
    version: "1.0",
    groups: [
      {
        title: "Die Kontaktliste des Vereins",
        items: [
          "Wer erreicht wen? Diese Seite zeigt Name, Telefonnummer, E-Mail-Adresse und Anschrift der Kolleginnen und Kollegen — soweit jede Person das selbst freigegeben hat.",
          "Am Handy genügt ein Tipp auf die Nummer zum Anrufen und einer auf die Adresse zum Schreiben einer E-Mail.",
          "Über dem Verzeichnis steht ein Suchfeld: Es filtert nach Name, Ort und Nummer.",
          "Freigegeben wird in der Tools-Übersicht im Tab „Mein Konto“, einzeln je Angabe. Ohne Freigabe steht nichts über dich hier — und ein entferntes Häkchen wirkt sofort.",
          "Diese Liste sehen nur angemeldete Personen des Vereins. Bankverbindung, Geburtsdatum und Dokumente sind hier grundsätzlich nie zu sehen."
        ]
      }
    ]
  }
];
