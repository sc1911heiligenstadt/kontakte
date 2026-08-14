# Anleitung: eigene Kontaktdaten für die Kontaktliste freigeben.
# Beschriftungen wörtlich aus E:\ToolsUebersicht\index.html gezogen (2026-08-13):
#   Tabs      -> "Dashboard", "Feedback & Hilfe", "Mein Konto", "Info"
#   Karte     -> "Kontaktliste des Vereins"
#   Häkchen   -> "Ich möchte in der Kontaktliste stehen", "Telefonnummer zeigen",
#                "E-Mail-Adresse zeigen", "Anschrift zeigen"
#   Knöpfe    -> "Freigabe speichern", "Zur Kontaktliste"
# Der Konto-Tab heißt nur ANGEMELDET "Mein Konto" (sonst "Anmelden") -- siehe
# renderNavTabs() in app.js.
#
# Aufruf:
#   powershell -File kontakt-schritte.ps1 -Ziel <scratchpad>\anleitung-kontakte
#
# UTF-8 MIT BOM speichern, sonst liest PowerShell 5.1 die Umlaute als ANSI.

param([string]$Ziel = "")
$ErrorActionPreference = 'Stop'
. (Join-Path $env:USERPROFILE ".claude\skills\meine-anleitungsbilder\scripts\anleitung-lib.ps1")

$Ziel = ZielPruefen $Ziel
SchriftenLaden

# ---------------------------------------------------------------- Schritt 1
$r = NeueSeite; $bmp = $r[0]; $g = $r[1]
$y = Kopf $g 1 "Zu ${AUF}Mein Konto${ZU} gehen" "In der Tools-Übersicht, oben in der Leiste."

$y = Tableiste $g $y @("Dashboard", "Feedback & Hilfe", "Mein Konto", "Info") "Mein Konto"
$y += 36

$y = Absatz $g $y "Der Tab heißt ${AUF}Mein Konto${ZU}, sobald du angemeldet bist. Bist du abgemeldet, steht dort ${AUF}Anmelden${ZU} — dann meld dich zuerst an."
$y = Absatz $g $y "Im Tab dann nach unten scrollen bis zu dieser Karte:" -Abstand 14

# ⚠️ HÖCHSTENS EINE Markierung je Bild -- die sitzt hier auf dem Tab. Die Karte
# darunter zeigt nur, wonach man sucht; ein zweiter roter Rahmen nähme dem ersten
# die Wirkung (erster Entwurf hatte beide).
$karte = Karte $g $y 150
[void](Text $g "Kontaktliste des Vereins" $SCHRIFT.Karte $TEXT 88 ($y + 26) 700)
[void](Text $g "Hier entscheidest du, ob und mit welchen Angaben du im Werkzeug Kontakte stehst." $SCHRIFT.Klein $MUTED 88 ($y + 74) 720)
$y = $karte.Bottom + 36

$y = Fuss $g $y "Du findest die Karte nicht? Dann bist du nicht angemeldet."
[void](Speichern $bmp $y (Join-Path $Ziel "schritt-1.png"))
$g.Dispose(); $bmp.Dispose()

# ---------------------------------------------------------------- Schritt 2
$r = NeueSeite; $bmp = $r[0]; $g = $r[1]
$y = Kopf $g 2 "Das obere Häkchen setzen" "Es entscheidet, ob du überhaupt in der Liste stehst."

$karte = Karte $g $y 200
[void](Text $g "Kontaktliste des Vereins" $SCHRIFT.Karte $TEXT 88 ($y + 26) 700)
# Der Name steht mit im Eintrag -- der Fließtext darunter verspricht ihn, im
# ersten Entwurf fehlte er im Bild und Bild und Text widersprachen sich.
[void](Hakenliste $g ($y + 82) @("Ich möchte in der Kontaktliste stehen   ·  Max Mustermann") @("Ich möchte in der Kontaktliste stehen   ·  Max Mustermann"))
Markiere $g 82 ($y + 74) 700 46
[void](Text $g "Ohne dieses Häkchen erscheinst du gar nicht — auch dann nicht," $SCHRIFT.Klein $MUTED 118 ($y + 134) 700)
[void](Text $g "wenn du darunter etwas angekreuzt hast." $SCHRIFT.Klein $MUTED 118 ($y + 162) 700)
$y = $karte.Bottom + 36

$y = Absatz $g $y "Neben dem Häkchen steht dein Name, so wie er in der Liste erscheinen würde."
$y = Absatz $g $y "Solange das Häkchen aus ist, sind die drei Zeilen darunter blass — sie wirken dann nicht." -Abstand 14

$y = Fuss $g $y "Du musst hier gar nichts freigeben. Es ist freiwillig."
[void](Speichern $bmp $y (Join-Path $Ziel "schritt-2.png"))
$g.Dispose(); $bmp.Dispose()

# ---------------------------------------------------------------- Schritt 3
$r = NeueSeite; $bmp = $r[0]; $g = $r[1]
$y = Kopf $g 3 "Aussuchen, was zu sehen ist" "Jede Angabe einzeln — nichts ist vorgegeben."

$eintraege = @(
  "Telefonnummer zeigen   ·  0171 2345678",
  "E-Mail-Adresse zeigen   ·  vorname.name@beispiel.de",
  "Anschrift zeigen   ·  Musterweg 1, 37308 Heilbad Heiligenstadt")
$karte = Karte $g $y (96 + $eintraege.Count * 52)
[void](Text $g "Was soll bei dir stehen?" $SCHRIFT.Karte $TEXT 88 ($y + 24) 700)
[void](Hakenliste $g ($y + 84) $eintraege @("Anschrift zeigen   ·  Musterweg 1, 37308 Heilbad Heiligenstadt"))
$y = $karte.Bottom + 36

$y = Absatz $g $y "Hinter jedem Häkchen steht der Wert, um den es geht — du siehst also vorher, was du freigibst. Im Beispiel oben ist die Anschrift bewusst aus."
$y = Absatz $g $y "Steht dort ${AUF}nicht hinterlegt${ZU}, fehlt die Angabe in deinen Trainerdaten. Trag sie dort nach, dann kannst du sie hier freigeben." -Abstand 14

$y = Fuss $g $y "Bankverbindung, Geburtsdatum und Dokumente sind nie zu sehen."
[void](Speichern $bmp $y (Join-Path $Ziel "schritt-3.png"))
$g.Dispose(); $bmp.Dispose()

# ---------------------------------------------------------------- Schritt 4
$r = NeueSeite; $bmp = $r[0]; $g = $r[1]
$y = Kopf $g 4 "Speichern — fertig" "Ab jetzt finden dich die anderen."

$karte = Karte $g $y 170
[void](Text $g "Du stehst in der Kontaktliste — sichtbar sind dein Name" $SCHRIFT.Normal $TEXT 88 ($y + 26) 720)
[void](Text $g "sowie Telefonnummer, E-Mail-Adresse." $SCHRIFT.Normal $TEXT 88 ($y + 58) 720)
$kb = Knopf $g 88 ($y + 100) "Freigabe speichern" $true
# ⚠️ Die x-Position des zweiten Knopfes AUS DER BREITE des ersten rechnen, nicht
# schätzen: mit einem festen Wert (320) überlappten die beiden, und der rote Rahmen
# schnitt in die zweite Beschriftung.
[void](Knopf $g (88 + $kb[0] + 18) ($y + 100) "Zur Kontaktliste" $false)
Markiere $g 88 ($y + 100) $kb[0] $kb[1]
$y = $karte.Bottom + 36

$y = Absatz $g $y "Nach dem Speichern steht oben in der Karte, was jetzt von dir zu sehen ist."
$y = Absatz $g $y "Du kannst das jederzeit ändern:" -Fett -Abstand 12
$y = Punkte $g $y @(
  "Häkchen entfernen und wieder speichern — die Angabe verschwindet sofort.",
  "Das obere Häkchen entfernen — du bist komplett aus der Liste raus.",
  "Später anders entscheiden — die Karte bleibt an derselben Stelle.")
$y += 14

$y = Fuss $g $y "Die Liste sehen nur angemeldete Personen des Vereins. Nach außen geht nichts."
[void](Speichern $bmp $y (Join-Path $Ziel "schritt-4.png"))
$g.Dispose(); $bmp.Dispose()

SchriftenFreigeben
"Fertig: 4 Bilder in $Ziel"
