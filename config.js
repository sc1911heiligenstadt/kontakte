// Öffentliche Versionsnummer der App. Bleibt flottenweit auf "1.0" — gezählt wird
// im Changelog darunter, nicht hier.
const APP_VERSION = "1.0";

// Adresse der Trainerdaten-App: der einzige Ort, an dem die Freigabe gesetzt wird.
// Steht hier als Konstante, weil sie an mehreren Stellen im Text auftaucht.
const TRAINERDATEN_URL = "https://sc1911heiligenstadt.github.io/Trainerdaten/";

const APP_CHANGELOG = [
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
