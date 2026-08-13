// Zugriff über das zentrale ToolsUebersicht-Login-Gateway.
// Vorlage: E:\personalakte\db.js (gleiches Gateway-Muster).
//
// Diese App speichert NICHTS und hat deshalb bewusst weder einen Eintrag in
// `DAV_APPS` noch ein generisches dav-load/dav-save: sie kennt genau eine
// lesende Aktion. Die Daten selbst pflegt jede Person in Trainerdaten, die
// Freigabe ebenfalls dort.
const GATEWAY_URL = "https://landingpage.michel-brunner.workers.dev";
const TOKEN_STORAGE_KEY = "tu_session_token";
const GATEWAY_APP_ID = "kontakte";

class NotLoggedInError extends Error {
  constructor(message) {
    super(message || "Nicht angemeldet");
    this.name = "NotLoggedInError";
  }
}

function getSessionToken() {
  try { return localStorage.getItem(TOKEN_STORAGE_KEY); } catch (_) { return null; }
}

async function gatewayRequest(payload) {
  const token = getSessionToken();
  if (!token) throw new NotLoggedInError();
  const resp = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify(payload)
  });
  if (resp.status === 401) throw new NotLoggedInError("Sitzung abgelaufen");
  if (resp.status === 403) throw new Error("Kein Zugriff auf dieses Werkzeug.");
  if (!resp.ok) throw new Error(`Gateway-Fehler (HTTP ${resp.status})`);
  return resp.json();
}

// Liefert {username, isAdmin, groupIds, vorname, nachname, ...} der eingeloggten Person.
async function fetchMe() {
  return gatewayRequest({ action: "me", app: GATEWAY_APP_ID });
}

// Liefert { kontakte: [{vorname, nachname, telefon?, email?, adresse?}] }.
//
// ⚠️ Die Filterung passiert im WORKER, nicht hier: ein nicht freigegebenes Feld
// fehlt in der Antwort schon, statt hier ausgeblendet zu werden. Wer hier je eine
// „zeig doch alles"-Abkürzung einbaut, findet nichts — es ist nichts da.
async function fetchKontakte() {
  return gatewayRequest({ action: "kontakte-liste" });
}
