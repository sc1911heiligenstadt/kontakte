# Kontakte

Die Kontaktliste des 1. SC 1911 Heiligenstadt: Name, Telefonnummer,
E-Mail-Adresse und Anschrift der Mitarbeiterinnen und Mitarbeiter — soweit
jede Person das selbst freigegeben hat.

**Live:** https://sc1911heiligenstadt.github.io/kontakte/

## Wie eine Angabe hierher kommt

Die Daten liegen in [Trainerdaten](https://sc1911heiligenstadt.github.io/Trainerdaten/)
und werden nicht doppelt gepflegt. **Freigegeben** wird in der
[Tools-Übersicht](https://sc1911heiligenstadt.github.io/ToolsUebersicht/) im Tab
**„Mein Konto“**, Karte *Kontaktliste des Vereins*: dort gibt jede Person einzeln
frei, was erscheinen darf — Name, Telefonnummer, E-Mail-Adresse, Anschrift. Ohne
Freigabe steht nichts hier, und ein entferntes Häkchen wirkt sofort.

## Technik

Vanilla JS, kein Build-Step, GitHub Pages. Die App **speichert nichts** und hat
deshalb keinen Eintrag in `DAV_APPS`: sie kennt genau eine lesende
Gateway-Aktion (`kontakte-liste` in `E:\ToolsUebersicht\admin-worker.js`).

Gefiltert wird **serverseitig** — ein nicht freigegebenes Feld verlässt den
Worker gar nicht erst. Bankverbindung, Geburtsdatum, Dokumente und
Vertragsdaten sind grundsätzlich nie Teil der Antwort.

Zugang: angemeldet, kein Spielerkonto, plus die normale Tool-Sichtbarkeit aus
dem Sichtbarkeits-Panel der Tools-Übersicht.

## Lokal starten

```
Port 8816 (Eintrag "kontakte" in E:\.claude\launch.json)
```
