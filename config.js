// Öffentliche Versionsnummer der App. Bleibt flottenweit auf "1.0" — gezählt wird
// im Changelog darunter, nicht hier.
const APP_VERSION = "1.0";

// Adresse der Trainerdaten-App: der einzige Ort, an dem die Freigabe gesetzt wird.
// Steht hier als Konstante, weil sie an mehreren Stellen im Text auftaucht.
const TRAINERDATEN_URL = "https://sc1911heiligenstadt.github.io/Trainerdaten/";

const APP_CHANGELOG = [
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
          "Freigegeben wird in „Trainerdaten“ unter „Meine Daten“, einzeln je Angabe. Ohne Freigabe steht nichts über dich hier — und ein entferntes Häkchen wirkt sofort.",
          "Diese Liste sehen nur angemeldete Personen des Vereins. Bankverbindung, Geburtsdatum und Dokumente sind hier grundsätzlich nie zu sehen."
        ]
      }
    ]
  }
];
