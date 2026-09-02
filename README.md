# Kontakte

Die Kontaktliste des 1. SC 1911 Heiligenstadt: Name, Telefonnummer,
E-Mail-Adresse und Anschrift der Mitarbeiterinnen und Mitarbeiter — soweit
jede Person das selbst freigegeben hat.

**Live:** https://sc1911heiligenstadt.github.io/kontakte/

## Was drin ist

| Reiter | Wofür |
|---|---|
| **Kontakte** | Das Verzeichnis: Name, Telefonnummer, E-Mail-Adresse und Anschrift, soweit freigegeben. Suchfeld über Name, Ort und Nummer; Knöpfe zum Anrufen, für WhatsApp (nur bei Handynummern) und für E-Mail |
| **Mannschaften** | Wer betreut welche Mannschaft — mit Liga und dem gerechneten Jahrgang, umschaltbar zwischen den Saisons. Suchfeld und ein Ausdruck fürs Schwarze Brett |
| **Info** | Was die App kann, die Änderungen und der Datenschutzhinweis — für alle sichtbar |

## Wer wo zu sehen ist

Im Reiter **Kontakte** steht nur, was jede Person selbst freigegeben hat — ohne
Freigabe des Namens erscheint sie dort gar nicht.

Im Reiter **Mannschaften** gilt eine Feinheit: **Name und Rolle stehen immer da**, denn
wer eine Mannschaft betreut, ist Vereinsorganisation und steht ohnehin an jedem Aushang.
**Telefonnummer und E-Mail-Adresse nur bei Freigabe.** Die **Anschrift wird dort nie**
gezeigt, auch wenn sie freigegeben ist — für „wie erreiche ich den Trainer der D2“
genügen Nummer und E-Mail.

Der **Ausdruck** der Mannschaftsübersicht kommt ganz ohne Telefonnummern und
E-Mail-Adressen aus: freigegeben wurden die Angaben für die interne Liste, nicht für den
Schaukasten.

## Wie eine Angabe hierher kommt

Die Daten liegen in [Trainerdaten](https://sc1911heiligenstadt.github.io/Trainerdaten/)
und werden nicht doppelt gepflegt. **Freigegeben** wird in der
[Tools-Übersicht](https://sc1911heiligenstadt.github.io/ToolsUebersicht/) im Tab
**„Mein Konto“**, Karte *Kontaktliste des Vereins*: dort gibt jede Person einzeln
frei, was erscheinen darf — Name, Telefonnummer, E-Mail-Adresse, Anschrift. Ohne
Freigabe steht nichts hier, und ein entferntes Häkchen wirkt sofort.

## Technik

Vanilla JS, kein Build-Step, GitHub Pages. Die App **speichert nichts** und hat
deshalb keinen Eintrag in `DAV_APPS`: sie kennt zwei lesende Gateway-Aktionen
(`kontakte-liste` und `kontakte-mannschaften` in
`E:\ToolsUebersicht\admin-worker.js`).

Gefiltert wird **serverseitig** — ein nicht freigegebenes Feld verlässt den
Worker gar nicht erst. Bankverbindung, Geburtsdatum, Dokumente und
Vertragsdaten sind grundsätzlich nie Teil der Antwort.

Zugang: angemeldet, kein Spielerkonto, plus die normale Tool-Sichtbarkeit aus
dem Sichtbarkeits-Panel der Tools-Übersicht.

## Lokal starten

```
Port 8816 (Eintrag "kontakte" in E:\.claude\launch.json)
```
