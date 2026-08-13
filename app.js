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
// OHNE führende Null — aus "0177 8587294" muss "491778587294" werden. Liefert ""
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
    b.addEventListener("click", () => activateTab(b.dataset.tab));
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

  if (!getSessionToken()) {
    showConnectScreen();
    return;
  }

  try {
    const me = await fetchMe();
    currentUsername = me.username;
    currentIsAdmin = !!me.isAdmin;
    currentVorname = me.vorname || null;
    currentNachname = me.nachname || null;
    const res = await fetchKontakte();
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
