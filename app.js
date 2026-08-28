// Kontaktliste des Vereins. Reine Anzeige — diese App schreibt nichts.
// Die Daten stammen aus Trainerdaten und werden vom Gateway (Aktion
// `kontakte-liste` in E:\ToolsUebersicht\admin-worker.js) bereits auf die
// freigegebenen Felder gefiltert ausgeliefert.
//
// ⚠️ Daraus folgt: was hier nicht ankommt, EXISTIERT hier nicht. Ein fehlendes
// Feld ist keine Anzeigefrage, sondern eine fehlende Freigabe — es gibt keinen
// Schalter, der „mehr" zeigen könnte.

let currentUsername = null;
let currentIsAdmin = false;
let currentVorname = null;
let currentNachname = null;

let alleKontakte = [];   // roher kontakte[]-Array aus fetchKontakte()
let suche = "";

// Mannschaftsansicht. Wird beim ERSTEN Öffnen des Tabs geladen, nicht beim
// Seitenstart: wer nur eine Nummer nachschlagen will, soll dafür nicht auf
// einen zweiten Abruf warten (der Worker liest dort zwei Dateien statt einer).
let mannschaftenState = null;
let mannschaftenLaeuft = false;
let mannschaftenSuche = "";

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function vollerName(k) {
  return `${k.vorname || ""} ${k.nachname || ""}`.trim();
}

// Für den `tel:`-Link bleibt nur, was ein Telefon wählen kann. Die ANZEIGE behält
// die Schreibweise der Person (mit Leerzeichen und Klammern) — nur das href wird
// bereinigt, sonst wählt manches Handy die Nummer mit Leerzeichen nicht.
function telHref(nummer) {
  const roh = String(nummer || "").replace(/[^\d+]/g, "");
  // Ein führendes + darf bleiben, weitere Pluszeichen (Tippfehler) nicht.
  return roh.replace(/(?!^)\+/g, "");
}

// WhatsApp verlangt in `wa.me/<nummer>` das internationale Format OHNE Plus und
// OHNE führende Null — aus "0171 2345678" (erfundenes Beispiel) muss
// "491712345678" werden. Liefert ""
// wenn sich das nicht sicher ableiten lässt.
//
// ⚠️ `LAND_VORWAHL` ist die Annahme „eine Nummer ohne Ländervorwahl ist deutsch".
// Sie gilt für diesen Verein; wer das je anders braucht, ändert nur diese Zeile.
const LAND_VORWAHL = "49";
function waNummer(nummer) {
  let n = String(nummer || "").replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  else if (n.startsWith("00")) n = n.slice(2);
  else if (n.startsWith("0")) n = LAND_VORWAHL + n.slice(1);
  else return "";   // weder + noch 00 noch 0 -> Ländervorwahl unbekannt, nicht raten
  return /^\d{8,15}$/.test(n) ? n : "";
}

// ⚠️ Der WhatsApp-Knopf erscheint nur bei einer erkennbaren MOBILnummer.
// Eine Festnetznummer (03606 …) ist nie bei WhatsApp — der Knopf könnte dort nur
// scheitern, und ein Knopf, der nur scheitern kann, ist schlechter als keiner
// (gleiche Linie wie der Löschen-Knopf in der Personalakte).
// Deutsche Mobilnummern beginnen nach der Ländervorwahl mit 15, 16 oder 17.
// Bei einer AUSLÄNDISCHEN Nummer lässt sich das nicht beurteilen — dort wird der
// Knopf gezeigt: wer eine internationale Nummer einträgt, hat sich etwas dabei
// gedacht, und im Verein ist das die seltene Ausnahme.
function waHref(nummer) {
  const n = waNummer(nummer);
  if (!n) return "";
  if (n.startsWith(LAND_VORWAHL)) {
    const ohneLand = n.slice(LAND_VORWAHL.length);
    if (!/^1[5-7]/.test(ohneLand)) return "";
  }
  return "https://wa.me/" + n;
}

function adresseZeilen(a) {
  if (!a) return [];
  const zeilen = [];
  if (a.strasse) zeilen.push(a.strasse);
  const ortszeile = [a.plz, a.ort].filter(Boolean).join(" ");
  if (ortszeile) zeilen.push(ortszeile);
  return zeilen;
}

function renderChangelog() {
  const list = document.getElementById("changelog-list");
  list.innerHTML = APP_CHANGELOG.map((entry) => `
    <div class="changelog-entry">
      <span class="cv">Version ${escapeHtml(entry.version)}</span>
      ${entry.groups.map((g) => `
        <div class="changelog-group">
          <div class="cg-title">${escapeHtml(g.title)}</div>
          <ul class="cg-items">${g.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
        </div>
      `).join("")}
    </div>
  `).join("");
}

function renderHeaderUser() {
  const el = document.getElementById("header-user");
  if (!el) return;
  if (!currentUsername) { el.textContent = ""; return; }
  const name = (currentVorname || currentNachname) ? `${currentVorname || ""} ${currentNachname || ""}`.trim() : currentUsername;
  el.textContent = "👤 " + name + (currentIsAdmin ? " (Admin)" : "");
}

function activateTab(name) {
  document.querySelectorAll("nav button[data-tab]").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tab-section").forEach((s) => s.classList.remove("active"));
  const navBtn = document.querySelector(`nav button[data-tab="${name}"]`);
  if (navBtn) navBtn.classList.add("active");
  document.getElementById("tab-" + name).classList.add("active");
}

function setupTabs() {
  document.querySelectorAll("nav button[data-tab]").forEach((b) => {
    b.addEventListener("click", () => {
      activateTab(b.dataset.tab);
      // Erst beim Öffnen holen, und nur einmal. Ein zweiter Abruf bei jedem
      // Tabwechsel wäre bei einer Liste, die sich selten ändert, verschwendet.
      if (b.dataset.tab === "mannschaften" && !mannschaftenState && !mannschaftenLaeuft) {
        mannschaftenLaden();
      }
    });
  });
}

// Sucht über alles, was sichtbar ist — Name, Ort und Nummer. Wer die Nummer eines
// Anrufers nachschlägt, sucht sonst vergeblich.
function gefiltert() {
  const q = suche.trim().toLowerCase();
  if (!q) return alleKontakte;
  return alleKontakte.filter((k) => {
    const felder = [
      vollerName(k),
      k.telefon || "",
      k.email || "",
      k.adresse ? [k.adresse.strasse, k.adresse.plz, k.adresse.ort].filter(Boolean).join(" ") : ""
    ];
    return felder.join(" ").toLowerCase().includes(q);
  });
}

// Ein Aktions-Knopf. Immer ein <a>, nie ein <button> mit JS dahinter: ein echter
// Link öffnet die Telefon-/Mail-/WhatsApp-App des Geräts über dessen eigene
// Schema-Behandlung, lässt sich lange drücken (Kopieren, „in neuem Tab") und
// funktioniert auch, wenn das Skript später einmal klemmt.
// `rel="noopener"` nur beim externen WhatsApp-Ziel.
function aktionsKnopf(href, klasse, symbol, text, titel, extern) {
  return `<a class="kontakt-aktion ${klasse}" href="${escapeHtml(href)}"` +
    (extern ? ` target="_blank" rel="noopener"` : "") +
    ` title="${escapeHtml(titel)}" aria-label="${escapeHtml(titel)}">` +
    `<span aria-hidden="true">${symbol}</span><span class="ka-text">${escapeHtml(text)}</span></a>`;
}

// ⚠️ Die Knöpfe stehen GESAMMELT unter den Angaben, nicht je Zeile rechts daneben.
// Erster Entwurf hatte sie in der Zeile: bei einer kurzen Nummer standen sie
// daneben, bei einer langen E-Mail-Adresse brachen sie in eine eigene Zeile um und
// klebten dort rechts — jede Karte sah anders aus, und in einer Rasterzeile
// nebeneinander wirkte das unruhig (von Michel per Screenshot gemeldet).
// Gesammelt unten hat jede Karte denselben Aufbau, unabhängig von der Textlänge:
// oben die Angaben zum Lesen, unten die Aktionen zum Tippen.
// Die Werte selbst bleiben zusätzlich anklickbar.
function karteHtml(k) {
  const zeilen = [];
  const knoepfe = [];

  if (k.telefon) {
    zeilen.push(`
      <div class="kontakt-zeile">
        <span class="kz-symbol">📞</span>
        <a class="kz-wert" href="tel:${escapeHtml(telHref(k.telefon))}">${escapeHtml(k.telefon)}</a>
      </div>`);
    knoepfe.push(aktionsKnopf("tel:" + telHref(k.telefon), "ka-anruf", "📞", "Anrufen", "Anrufen: " + k.telefon, false));
    const wa = waHref(k.telefon);
    if (wa) knoepfe.push(aktionsKnopf(wa, "ka-wa", "💬", "WhatsApp", "WhatsApp-Nachricht an " + k.telefon, true));
  }
  if (k.email) {
    zeilen.push(`
      <div class="kontakt-zeile">
        <span class="kz-symbol">✉️</span>
        <a class="kz-wert" href="mailto:${escapeHtml(k.email)}">${escapeHtml(k.email)}</a>
      </div>`);
    knoepfe.push(aktionsKnopf("mailto:" + k.email, "ka-mail", "✉️", "Mail", "E-Mail schreiben an " + k.email, false));
  }
  const adr = adresseZeilen(k.adresse);
  if (adr.length) {
    zeilen.push(`
      <div class="kontakt-zeile kz-adresse">
        <span class="kz-symbol">🏠</span>
        <span class="kz-adresse-text">${adr.map(escapeHtml).join("<br />")}</span>
      </div>`);
  }
  // Eine Karte nur mit Namen sieht sonst nach einem Ladefehler aus.
  const inhalt = zeilen.length
    ? zeilen.join("")
    : `<div class="kontakt-nur-name">Nur der Name ist freigegeben.</div>`;
  // Nur eine Anschrift freigegeben? Dann gibt es nichts zu tippen und die Reihe
  // entfällt ganz, statt als leerer Streifen dazustehen.
  const aktionen = knoepfe.length
    ? `<div class="kontakt-aktionen">${knoepfe.join("")}</div>`
    : "";
  return `
    <div class="kontakt-karte">
      <div class="kontakt-name">${escapeHtml(vollerName(k))}</div>
      ${inhalt}
      ${aktionen}
    </div>`;
}

// ---------- Mannschaftsübersicht ----------

// Eine Person in einer Mannschaft. Name und Rolle stehen immer da, Telefon und
// E-Mail nur, wenn sie ankommen.
//
// ⚠️ Bewusst KEIN Hinweis wie „nicht freigegeben“ an der einzelnen Person. Die
// Freigabe ist eine Einwilligung, und eine Oberfläche, die bei jedem Namen
// vermerkt, dass er sie nicht erteilt hat, macht Druck — dieselbe Überlegung,
// aus der das Freigabe-Badge in Trainerdaten nie ein rotes „offen“ zeigt. Der
// erklärende Satz steht dafür einmal über der Liste.
function personHtml(p) {
  const werte = [];
  const knoepfe = [];
  if (p.telefon) {
    werte.push(`<span class="mt-wert">📞 <a href="tel:${escapeHtml(telHref(p.telefon))}">${escapeHtml(p.telefon)}</a></span>`);
    knoepfe.push(aktionsKnopf("tel:" + telHref(p.telefon), "ka-anruf", "📞", "Anrufen", "Anrufen: " + p.telefon, false));
    const wa = waHref(p.telefon);
    if (wa) knoepfe.push(aktionsKnopf(wa, "ka-wa", "💬", "WhatsApp", "WhatsApp-Nachricht an " + p.telefon, true));
  }
  if (p.email) {
    werte.push(`<span class="mt-wert">✉️ <a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></span>`);
    knoepfe.push(aktionsKnopf("mailto:" + p.email, "ka-mail", "✉️", "Mail", "E-Mail schreiben an " + p.email, false));
  }
  return `
    <div class="mt-person">
      <div class="mt-person-kopf">
        <span class="mt-person-name">${escapeHtml(p.name || "")}</span>
        <span class="mt-rolle">${escapeHtml(p.rolleLabel || "Trainer")}</span>
      </div>
      ${werte.length ? `<div class="mt-werte">${werte.join("")}</div>` : ""}
      ${knoepfe.length ? `<div class="kontakt-aktionen">${knoepfe.join("")}</div>` : ""}
    </div>`;
}

function teamHtml(t) {
  const meta = [t.liga, t.jahrgaenge ? "Jahrgänge " + t.jahrgaenge : ""].filter(Boolean);
  // Eine Mannschaft ohne Betreuer bleibt sichtbar: die Lücke ist fast immer ein
  // Pflegefehler in der Mannschaftsliste, und weggelassen fände sie niemand.
  const inhalt = t.personen && t.personen.length
    ? t.personen.map(personHtml).join("")
    : `<div class="mt-leer">Noch niemand eingetragen.</div>`;
  return `
    <div class="mt-team">
      <div class="mt-team-kopf">
        <span class="mt-kurz">${escapeHtml(t.kurz || "")}</span>
        <span class="mt-lang">${escapeHtml(t.lang || "")}</span>
      </div>
      ${meta.length ? `<div class="mt-meta">${meta.map(escapeHtml).join(" · ")}</div>` : ""}
      ${inhalt}
    </div>`;
}

// Sucht über alles, was in der Ansicht steht: Mannschaft, Liga, Jahrgang,
// Namen, Rollen — und die freigegebenen Nummern und Adressen, damit sich auch
// ein Anrufer nachschlagen lässt (gleiche Linie wie `gefiltert()` nebenan).
//
// ⚠️ Zwei verschiedene Treffer, bewusst mit verschiedener Wirkung:
//   Passt die MANNSCHAFT selbst („D2", „Verbandsliga", „2014"), bleibt sie
//   vollständig stehen — wer nach einer Mannschaft sucht, will das ganze Team.
//   Passt nur eine PERSON („Mustermann"), erscheint die Mannschaft mit genau dieser
//   Person — wer einen Namen sucht, will sehen, wo er steht, nicht die
//   Kollegenliste dazu.
function gefilterteTeams() {
  const q = mannschaftenSuche.trim().toLowerCase();
  const teams = (mannschaftenState && mannschaftenState.teams) || [];
  if (!q) return teams;
  return teams.map((t) => {
    const teamText = [t.kurz, t.lang, t.liga, t.jahrgaenge]
      .filter(Boolean).join(" ").toLowerCase();
    if (teamText.includes(q)) return t;
    const personen = (t.personen || []).filter((p) =>
      [p.name, p.rolleLabel, p.telefon, p.email]
        .filter(Boolean).join(" ").toLowerCase().includes(q));
    // Kein Treffer in der Mannschaft: sie fällt ganz weg. Sie mit leerer
    // Personenliste stehen zu lassen hieße „Noch niemand eingetragen" — und das
    // wäre eine Falschaussage über die Mannschaft statt über die Suche.
    return personen.length ? Object.assign({}, t, { personen: personen }) : null;
  }).filter(Boolean);
}

function renderMannschaftenSaison() {
  const sel = document.getElementById("mt-saison");
  if (!sel || !mannschaftenState) return;
  const saisons = mannschaftenState.saisons || [];
  // Nur eine einzige Saison? Dann wäre ein Auswahlfeld mit genau einem Eintrag
  // ein Bedienelement, das nichts kann.
  sel.parentElement.style.display = saisons.length > 1 ? "" : "none";
  sel.innerHTML = saisons.map((s) =>
    `<option value="${escapeHtml(s)}"${s === mannschaftenState.saison ? " selected" : ""}>${escapeHtml(s)}</option>`
  ).join("");
}

function renderMannschaften() {
  const rows = document.getElementById("mt-rows");
  const empty = document.getElementById("mt-empty");
  const kopf = document.getElementById("mt-druckkopf");
  if (!rows) return;

  if (mannschaftenLaeuft) {
    rows.innerHTML = "";
    empty.style.display = "";
    empty.textContent = "Wird geladen …";
    return;
  }
  if (!mannschaftenState) return;

  const alle = mannschaftenState.teams || [];
  const teams = gefilterteTeams();
  if (kopf) {
    // Auf dem Ausdruck steht, was auch am Bildschirm steht: wer nach „D" sucht
    // und dann druckt, will das Blatt der D-Mannschaften. Der Suchbegriff steht
    // deshalb mit im Kopf — sonst sieht ein unvollständiges Blatt aus wie die
    // ganze Liste.
    kopf.textContent = "1. SC 1911 Heiligenstadt e.V. — Mannschaften" +
      (mannschaftenState.saison ? " " + mannschaftenState.saison : "") +
      (mannschaftenSuche.trim() ? " · Suche: " + mannschaftenSuche.trim() : "");
  }
  renderMannschaftenSaison();

  if (!teams.length) {
    rows.innerHTML = "";
    empty.style.display = "";
    // Zwei Leerzustände, die man nicht verwechseln darf (gleiche Überlegung wie
    // bei der Namensliste): „keine Mannschaft eingetragen" ist ein Zustand der
    // Daten, „kein Treffer" einer der Suche.
    empty.textContent = alle.length
      ? "Keine Mannschaft und keine Person passt zu dieser Suche."
      : "Für diese Saison ist keine Mannschaft eingetragen.";
    return;
  }
  empty.style.display = "none";
  rows.innerHTML = teams.map(teamHtml).join("");
}

async function mannschaftenLaden(saison) {
  mannschaftenLaeuft = true;
  renderMannschaften();
  try {
    mannschaftenState = await fetchMannschaften(saison);
  } catch (e) {
    mannschaftenState = null;
    const empty = document.getElementById("mt-empty");
    const rows = document.getElementById("mt-rows");
    if (rows) rows.innerHTML = "";
    if (empty) {
      empty.style.display = "";
      empty.textContent = "Die Mannschaften konnten nicht geladen werden: " + e.message;
    }
    mannschaftenLaeuft = false;
    return;
  }
  mannschaftenLaeuft = false;
  renderMannschaften();
}

// Drucken über eine Klasse am <body> statt über ein reines @media print:
// so wirkt das Druck-Layout NUR auf diesen Knopf. Ein Strg+P im Kontakte-Tab
// druckt weiter genau das, was es bisher gedruckt hat — ein Nebeneffekt dort
// wäre eine Änderung, die niemand bestellt hat.
//
// ⚠️ Auf dem Blatt stehen KEINE Telefonnummern und E-Mail-Adressen (siehe
// style.css). Ein Ausdruck wandert ans Schwarze Brett oder in fremde Hände;
// freigegeben wurden die Angaben für die interne Liste, nicht für den
// Schaukasten.
function mannschaftenDrucken() {
  document.body.classList.add("drucken-mannschaften");
  const aufraeumen = function () {
    document.body.classList.remove("drucken-mannschaften");
    window.removeEventListener("afterprint", aufraeumen);
  };
  window.addEventListener("afterprint", aufraeumen);
  window.print();
  // Safari auf älteren Geräten feuert `afterprint` nicht zuverlässig — ohne
  // dieses Netz bliebe die Seite danach im Druck-Layout stehen.
  setTimeout(aufraeumen, 3000);
}

function renderListe() {
  const rows = document.getElementById("liste-rows");
  const empty = document.getElementById("liste-empty");
  const zaehler = document.getElementById("kontakt-anzahl");
  const liste = gefiltert();

  zaehler.textContent = alleKontakte.length === 1
    ? "1 Eintrag"
    : `${alleKontakte.length} Einträge`;

  if (!liste.length) {
    rows.innerHTML = "";
    empty.style.display = "";
    // Zwei sehr verschiedene Leerzustände, die man nicht verwechseln darf: „noch
    // niemand hat freigegeben" braucht einen Weg nach vorn, „Suche ohne Treffer"
    // nicht (siehe [[feedback-repeated-question-signals-missing-path]]).
    empty.innerHTML = alleKontakte.length === 0
      ? `Noch hat niemand Angaben freigegeben.<br /><br />
         <a class="btn small" href="${escapeHtml(FREIGABE_URL)}">Eigene Angaben freigeben</a>`
      : "Kein Eintrag passt zu dieser Suche.";
    return;
  }
  empty.style.display = "none";
  rows.innerHTML = liste.map(karteHtml).join("");
}

function showApp() {
  document.getElementById("connect-screen").style.display = "none";
  document.getElementById("app-shell").style.display = "block";
}

function showConnectScreen(errorMsg) {
  document.getElementById("connect-screen").style.display = "block";
  document.getElementById("app-shell").style.display = "none";
  const err = document.getElementById("connect-error");
  err.style.display = errorMsg ? "block" : "none";
  err.textContent = errorMsg || "";
}

async function init() {
  document.getElementById("version-badge-2").textContent = "v" + APP_VERSION;
  renderChangelog();
  setupTabs();
  document.getElementById("link-freigabe").href = FREIGABE_URL;
  document.getElementById("filter-suche").addEventListener("input", (e) => {
    suche = e.target.value;
    renderListe();
  });
  document.getElementById("mt-saison").addEventListener("change", (e) => {
    mannschaftenLaden(e.target.value);
  });
  document.getElementById("mt-drucken").addEventListener("click", mannschaftenDrucken);
  document.getElementById("mt-suche").addEventListener("input", (e) => {
    mannschaftenSuche = e.target.value;
    renderMannschaften();
  });

  if (!getSessionToken()) {
    showConnectScreen();
    return;
  }

  // ⚠️ Bis 2026-08-28 liefen me und die Kontaktliste NACHEINANDER, obwohl keiner
  // das Ergebnis des anderen braucht -- ein voller Roundtrip (~180 ms) zu viel.
  // Jetzt gemeinsam angestossen, ausgewertet in der bisherigen Reihenfolge.
  const meP = fetchMe();
  meP.catch(() => {}); // Platzhalter gegen unhandled rejection, falls das erste await wirft
  const kontakteP = fetchKontakte();
  kontakteP.catch(() => {});

  try {
    const me = await meP;
    currentUsername = me.username;
    currentIsAdmin = !!me.isAdmin;
    currentVorname = me.vorname || null;
    currentNachname = me.nachname || null;
    const res = await kontakteP;
    alleKontakte = Array.isArray(res.kontakte) ? res.kontakte : [];
    renderListe();
    showApp();
    renderHeaderUser();
  } catch (e) {
    if (e instanceof NotLoggedInError) {
      showConnectScreen();
    } else {
      showConnectScreen("Fehler beim Laden: " + e.message);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => { init(); });
