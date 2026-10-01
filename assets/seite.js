/* Skript fuer Startseite, Privat- und Firmenkunden. Jeder Teil prueft
   selbst, ob es das jeweilige Element gibt, und laeuft daher auf allen
   drei Seiten unveraendert.

   Das fruehere eigene Besucher-Tracking ist abgeschaltet. Formulare
   senden an das Formular-Backend (Google Apps Script) und gelten erst
   als gesendet, wenn das Backend die Speicherung bestaetigt. */

/* =========================
   BASIS-FUNKTIONEN
========================= */

const header = document.querySelector('.header');

if(header){
  window.addEventListener('scroll', () => {
    window.scrollY > 20 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
  });
}

const revealItems = document.querySelectorAll('.reveal');

if(revealItems.length){
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('show');
      }else{
        entry.target.classList.remove('show');
      }
    });
  }, { threshold: .12 });

  revealItems.forEach(item => revealObserver.observe(item));
}

document.querySelectorAll('.back-to-top').forEach(button => {
  button.addEventListener('click', () => {
    window.scrollTo({ top:0, left:0, behavior:'smooth' });
  });
});

document.querySelectorAll('.date-field').forEach(field => {
  const today = new Date().toISOString().split('T')[0];
  field.setAttribute('min', today);
});

/* =========================
   DROPDOWN NACH KLICK SCHLIESSEN
========================= */

document.querySelectorAll('.dropdown-content a').forEach(link => {
  link.addEventListener('click', () => {
    const dropdown = link.closest('.dropdown');
    if(!dropdown) return;

    dropdown.classList.add('force-close');

    setTimeout(() => {
      dropdown.classList.remove('force-close');
    }, 700);
  });
});


/* =========================
   SEITENBEREICH
========================= */

function getPageSource(){
  const path = window.location.pathname;

  if(path.includes('/privat')) return 'Privatkunden';
  if(path.includes('/firmen')) return 'Firmenkunden';
  if(path.includes('/stellen')) return 'Stellenangebote';
  if(path.includes('/impressum')) return 'Impressum';
  if(path.includes('/datenschutz')) return 'Datenschutz';

  return 'Startseite';
}

/* Das fruehere Besucher-Tracking ist abgeschaltet. Seine Kennung im
   Browser-Speicher wird bei Besuchern entfernt. */
try{
  window.localStorage.removeItem('ahs_visitor_id');
  window.localStorage.removeItem('ahs_visitor_time');
}catch(error){
  /* Speicher gesperrt (z. B. privater Modus): nichts zu tun */
}


/* =========================
   ZEICHENZÄHLER
========================= */

document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
  const counter = textarea.closest('.form-field') ? textarea.closest('.form-field').querySelector('.char-counter') : null;

  function updateCounter(){
    if(counter){
      counter.textContent = textarea.value.length + ' / ' + textarea.getAttribute('maxlength') + ' Zeichen';
    }
  }

  textarea.addEventListener('input', updateCounter);
  updateCounter();
});

/* =========================
   SONSTIGES-FELD
========================= */

document.querySelectorAll('.found-select').forEach(select => {
  const form = select.closest('form');
  if(!form) return;

  const sonstigesField = form.querySelector('.found-other-wrap');
  const sonstigesInput = form.querySelector('input[name="GefundenSonstiges"]');

  function toggleOther(){
    if(!sonstigesField || !sonstigesInput) return;

    if(select.value === 'Sonstiges'){
      sonstigesField.style.display = 'block';
      sonstigesInput.required = true;
    }else{
      sonstigesField.style.display = 'none';
      sonstigesInput.required = false;
      sonstigesInput.value = '';
    }
  }

  select.addEventListener('change', toggleOther);
  toggleOther();
});

/* =========================
   FORMULAR-FEHLER
========================= */

function clearFormErrors(form){
  form.querySelectorAll('.form-field').forEach(field => {
    field.classList.remove('invalid');

    const error = field.querySelector('.error-message');
    if(error) error.textContent = '';
  });
}

function setFieldError(input, message){
  const field = input.closest('.form-field');
  if(!field) return;

  field.classList.add('invalid');

  const error = field.querySelector('.error-message');
  if(error) error.textContent = message || 'Bitte dieses Feld ausfüllen.';
}

function isValidEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isValidPhone(value){
  if(!value || value.trim() === '') return true;

  const cleaned = value.trim();
  const onlyAllowedCharacters = /^[0-9+()\/\-\s]+$/.test(cleaned);
  const digitsOnly = cleaned.replace(/\D/g, '');

  return onlyAllowedCharacters && digitsOnly.length >= 6 && digitsOnly.length <= 15;
}

function isValidGermanPlz(value){
  return /^[0-9]{5}$/.test((value || '').trim());
}

function validateCustomForm(form){
  clearFormErrors(form);

  let firstInvalid = null;

  form.querySelectorAll('[required]').forEach(input => {
    if(input.type === 'checkbox'){
      if(!input.checked){
        setFieldError(input, input.dataset.error);
        if(!firstInvalid) firstInvalid = input;
      }
      return;
    }

    if(!input.value || input.value.trim() === ''){
      setFieldError(input, input.dataset.error);
      if(!firstInvalid) firstInvalid = input;
      return;
    }
  });

  const emailInput = form.querySelector('input[name="E-Mail"]');
  if(emailInput && emailInput.value.trim() !== '' && !isValidEmail(emailInput.value.trim())){
    setFieldError(emailInput, emailInput.dataset.error || 'Bitte eine gültige E-Mail-Adresse eingeben.');
    if(!firstInvalid) firstInvalid = emailInput;
  }

  const plzInput = form.querySelector('input[name="PLZ"]');
  if(plzInput && plzInput.value.trim() !== '' && !isValidGermanPlz(plzInput.value.trim())){
    setFieldError(plzInput, plzInput.dataset.error || 'Bitte eine gültige 5-stellige PLZ eingeben.');
    if(!firstInvalid) firstInvalid = plzInput;
  }

  const callbackSelect = form.querySelector('.callback-select');
  const phoneInput = form.querySelector('input[name="Telefon"]');

  if(phoneInput && phoneInput.value.trim() !== '' && !isValidPhone(phoneInput.value.trim())){
    setFieldError(phoneInput, 'Bitte eine gültige Telefonnummer ohne Buchstaben eingeben.');
    if(!firstInvalid) firstInvalid = phoneInput;
  }

  if(callbackSelect && phoneInput && callbackSelect.value === 'Ja' && phoneInput.value.trim() === ''){
    setFieldError(phoneInput, 'Bitte Telefonnummer für den gewünschten Rückruf eingeben.');
    if(!firstInvalid) firstInvalid = phoneInput;
  }

  if(firstInvalid){
    firstInvalid.scrollIntoView({ behavior:'smooth', block:'center' });
    setTimeout(() => firstInvalid.focus(), 350);
    return false;
  }

  return true;
}

/* =========================
   POPUP
========================= */

function showPopup(success, title, message){
  const popup = document.getElementById('formPopup');
  const icon = document.getElementById('popupIcon');
  const popupTitle = document.getElementById('popupTitle');
  const popupMessage = document.getElementById('popupMessage');

  if(!popup || !icon || !popupTitle || !popupMessage) return;

  icon.textContent = success ? '✓' : '!';
  icon.style.background = success ? '#0e4e2d' : '#b42318';
  popupTitle.textContent = title;
  popupMessage.textContent = message;
  popup.classList.add('show');
}

const popupClose = document.getElementById('popupClose');

if(popupClose){
  popupClose.addEventListener('click', () => {
    const popup = document.getElementById('formPopup');
    if(popup) popup.classList.remove('show');
  });
}

/* =========================
   FORMULAR ABSENDEN
   Sendet an das Formular-Backend und wertet dessen JSON-Antwort aus.
   Erfolg nur bei success:true. Jede Anfrage traegt eine request_id;
   das Backend speichert dieselbe request_id nie zweimal.
========================= */

const FORM_TIMEOUT_MS = 15000;
const FORM_IFRAME_TIMEOUT_MS = 20000;
const FORM_CLIENT_VERSION = 'web-2026-10-01';

/* Zweiter Antwortweg: Kommt die Antwort auf dem normalen Weg nicht an
   (z. B. 404 bei script.googleusercontent.com/macros/echo), wird dieselbe
   Anfrage mit derselben request_id ueber einen unsichtbaren Rahmen
   gesendet. Das Backend meldet das Ergebnis dann per postMessage.
   Setzt Backend V2 voraus: nur V2 erkennt die gleiche request_id und
   speichert sie nicht doppelt. */
const FORM_IFRAME_FALLBACK = true;

/* Automatische Wiederholung bei "Server ausgelastet" (busy). */
const FORM_AUTO_RETRY = false;
const FORM_RETRY_DELAY_MS = 1500;

/* Herkunft der postMessage-Antwort: Apps Script liefert HTML aus einer
   Sandbox unter *.googleusercontent.com aus. */
const FORM_ANTWORT_URSPRUNG = /^https:\/\/([a-z0-9-]+\.)*(googleusercontent\.com|script\.google\.com)$/;

function createRequestId(){
  if(window.crypto && typeof window.crypto.randomUUID === 'function'){
    return window.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if(window.crypto && typeof window.crypto.getRandomValues === 'function'){
    window.crypto.getRandomValues(bytes);
  }else{
    for(let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' +
    hex.slice(16, 20) + '-' + hex.slice(20);
}

function getFormType(form){
  const field = form.querySelector('input[name="form_type"]');
  return field && field.value === 'firmen' ? 'firmen' : 'privat';
}

function getFormVariant(form){
  return form.dataset.formVariant === 'saison' ? 'saison' : 'anfrage';
}

/* Formularfelder als application/x-www-form-urlencoded: einfacher
   Request ohne CORS-Vorabfrage, im Backend als e.parameter lesbar. */
function buildFormBody(form, requestId){
  const body = new URLSearchParams();

  new FormData(form).forEach((value, key) => {
    if(typeof value === 'string') body.append(key, value);
  });

  body.set('request_id', requestId);
  body.set('form_variant', getFormVariant(form));
  body.set('page_path', window.location.pathname || '/');
  body.set('client_version', FORM_CLIENT_VERSION);

  return body;
}

/* Ergebnis: ok | rejected (Backend hat geantwortet, aber abgelehnt) |
   timeout | network | unreadable (Antwort kam, ist aber kein JSON) */
async function postForm(url, body){
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), FORM_TIMEOUT_MS) : null;

  try{
    const response = await fetch(url, {
      method:'POST',
      body:body,
      signal:controller ? controller.signal : undefined
    });

    const text = await response.text();
    let result = null;

    try{
      result = JSON.parse(text);
    }catch(error){
      return { kind:'unreadable' };
    }

    if(!result || typeof result.success !== 'boolean'){
      return { kind:'unreadable' };
    }

    return { kind:result.success ? 'ok' : 'rejected', result:result };
  }catch(error){
    return { kind:error && error.name === 'AbortError' ? 'timeout' : 'network' };
  }finally{
    if(timer) clearTimeout(timer);
  }
}

/* Sendet ueber ein unsichtbares Formular in einen unsichtbaren Rahmen.
   Das Backend antwortet mit einer kleinen Seite, die das Ergebnis per
   postMessage an diese Seite meldet. */
function postFormViaIframe(url, body, requestId){
  return new Promise(resolve => {
    const name = 'formular-antwort-' + requestId;
    const iframe = document.createElement('iframe');
    const sender = document.createElement('form');
    let timer = null;

    iframe.name = name;
    iframe.title = 'Formularversand';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';

    sender.method = 'POST';
    sender.action = url;
    sender.target = name;
    sender.acceptCharset = 'UTF-8';
    sender.style.display = 'none';

    const felder = new URLSearchParams(body);
    felder.set('transport', 'iframe');
    felder.set('origin', window.location.origin);

    felder.forEach((value, key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      sender.appendChild(input);
    });

    function fertig(outcome){
      window.removeEventListener('message', empfangen);
      clearTimeout(timer);
      sender.remove();
      setTimeout(() => iframe.remove(), 0);
      resolve(outcome);
    }

    function empfangen(event){
      if(!FORM_ANTWORT_URSPRUNG.test(event.origin)) return;

      const result = event.data;
      if(!result || result.typ !== 'alltagshilfe-formular') return;
      if(result.request_id !== requestId) return;
      if(typeof result.success !== 'boolean') return;

      fertig({ kind:result.success ? 'ok' : 'rejected', result:result });
    }

    window.addEventListener('message', empfangen);
    timer = setTimeout(() => fertig({ kind:'timeout' }), FORM_IFRAME_TIMEOUT_MS);

    document.body.appendChild(iframe);
    document.body.appendChild(sender);
    sender.submit();
  });
}

/* Antwort kam auf dem normalen Weg nicht lesbar an */
function needsFallback(outcome){
  return outcome.kind === 'timeout' || outcome.kind === 'network' || outcome.kind === 'unreadable';
}

function isRetryable(outcome){
  if(outcome.kind === 'timeout' || outcome.kind === 'network' || outcome.kind === 'unreadable') return true;
  return outcome.kind === 'rejected' && outcome.result.error_code === 'busy';
}

/* Markiert die Felder, die das Backend als fehlerhaft meldet. */
function showServerFieldErrors(form, fields){
  let firstInvalid = null;

  (fields || []).forEach(name => {
    const input = Array.from(form.elements).find(element => element.name === name);
    if(!input || input.type === 'hidden') return;

    setFieldError(input, input.dataset.error);
    if(!firstInvalid) firstInvalid = input;
  });

  if(firstInvalid){
    firstInvalid.scrollIntoView({ behavior:'smooth', block:'center' });
    setTimeout(() => firstInvalid.focus(), 350);
  }

  return !!firstInvalid;
}

function resetFormAfterSuccess(form){
  form.reset();
  clearFormErrors(form);

  form.querySelectorAll('textarea[maxlength]').forEach(textarea => {
    textarea.dispatchEvent(new Event('input'));
  });

  form.querySelectorAll('.found-select').forEach(select => {
    select.dispatchEvent(new Event('change'));
  });
}

function showSubmitResult(form, outcome){
  const variant = getFormVariant(form);

  if(outcome.kind === 'ok'){
    const anfrageId = outcome.result.anfrage_id;
    const nummer = anfrageId ? ' Ihre Anfrage-Nummer: ' + anfrageId + '.' : '';

    if(variant === 'saison'){
      showPopup(true, 'Vormerkung gesendet',
        'Vielen Dank. Ihre Vormerkung ist bei uns eingegangen. Wir melden uns mit einem Angebot.' + nummer);
    }else{
      showPopup(true, 'Anfrage gesendet',
        'Vielen Dank. Ihre Anfrage wurde übermittelt. Wir melden uns schnellstmöglich zurück.' + nummer);
    }
    return;
  }

  if(outcome.kind === 'rejected' && outcome.result.error_code === 'validation'){
    showServerFieldErrors(form, outcome.result.fields);
    showPopup(false, 'Bitte Angaben prüfen',
      'Einige Angaben sind unvollständig oder ungültig. Bitte prüfen Sie die markierten Felder.');
    return;
  }

  if(outcome.kind === 'rejected' && outcome.result.error_code === 'busy'){
    showPopup(false, 'Bitte gleich noch einmal senden',
      'Der Server ist gerade ausgelastet. Ihre Angaben sind noch im Formular – bitte senden Sie in einem Moment erneut.');
    return;
  }

  showPopup(false, 'Anfrage konnte nicht bestätigt werden',
    'Ihre Angaben sind noch im Formular. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt per Telefon oder WhatsApp.');
}

document.querySelectorAll('.ajax-form').forEach(form => {
  const button = form.querySelector('.submit-btn');
  const defaultButtonText = form.dataset.buttonText || 'Anfrage senden';
  let sending = false;

  /* Wer etwas aendert, stellt eine neue Anfrage: neue request_id.
     Unveraendert erneut gesendet = dieselbe request_id, damit das
     Backend eine Wiederholung erkennt. */
  const forgetRequestId = () => { delete form.dataset.requestId; };
  form.addEventListener('input', forgetRequestId);
  form.addEventListener('change', forgetRequestId);

  form.addEventListener('submit', async function(event){
    event.preventDefault();

    if(sending) return;

    if(!validateCustomForm(form)){
      return;
    }

    sending = true;

    if(button){
      button.disabled = true;
      button.textContent = 'Wird gesendet...';
    }

    if(!form.dataset.requestId) form.dataset.requestId = createRequestId();
    const requestId = form.dataset.requestId;
    const body = buildFormBody(form, requestId);

    try{
      let outcome = await postForm(form.action, body);

      if(FORM_IFRAME_FALLBACK && needsFallback(outcome)){
        outcome = await postFormViaIframe(form.action, body, requestId);
      }

      if(FORM_AUTO_RETRY && isRetryable(outcome)){
        await new Promise(resolve => setTimeout(resolve, FORM_RETRY_DELAY_MS));
        outcome = await postForm(form.action, body);
      }

      if(outcome.kind === 'ok'){
        delete form.dataset.requestId;
        resetFormAfterSuccess(form);
      }

      showSubmitResult(form, outcome);

      if(outcome.kind === 'ok'){
        /* Fuer spaetere Messung (GTM) und das Saison-Fenster. Enthaelt
           bewusst keine Formularinhalte. */
        form.dispatchEvent(new CustomEvent('anfrage:gesendet', {
          bubbles:true,
          detail:{
            request_id:outcome.result.request_id || requestId,
            anfrage_id:outcome.result.anfrage_id || '',
            form_type:getFormType(form),
            form_variant:getFormVariant(form),
            duplicate:!!outcome.result.duplicate
          }
        }));
      }
    }finally{
      sending = false;

      if(button){
        button.disabled = false;
        button.textContent = defaultButtonText;
      }
    }
  });
});


/* Mobile-Menü: nur öffnen, wenn man es braucht */
(function(){
  const menuButton = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');

  if(menuButton && nav){
    menuButton.addEventListener('click', function(){
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuButton.textContent = isOpen ? 'Schließen' : 'Menü';
    });
  }

  document.querySelectorAll('.dropbtn').forEach(button => {
    button.addEventListener('click', function(event){
      if(window.innerWidth > 900) return;

      event.preventDefault();
      event.stopPropagation();

      const currentDropdown = button.closest('.dropdown');
      if(!currentDropdown) return;

      document.querySelectorAll('.dropdown.open').forEach(dropdown => {
        if(dropdown !== currentDropdown){
          dropdown.classList.remove('open');
        }
      });

      currentDropdown.classList.toggle('open');
    });
  });

  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', function(){
      if(nav) nav.classList.remove('open');
      if(menuButton){
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = 'Menü';
      }
      document.querySelectorAll('.dropdown.open').forEach(dropdown => dropdown.classList.remove('open'));

      /* force-close nur mobil sofort aufheben.
         Auf dem Desktop schliesst es das Dropdown nach dem Klick kurz weg. */
      if(window.innerWidth <= 900){
        document.querySelectorAll('.dropdown.force-close').forEach(dropdown => dropdown.classList.remove('force-close'));
      }
    });
  });

  window.addEventListener('resize', function(){
    if(window.innerWidth > 900){
      if(nav) nav.classList.remove('open');
      if(menuButton){
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = 'Menü';
      }
      document.querySelectorAll('.dropdown.open').forEach(dropdown => dropdown.classList.remove('open'));
    }
  });
})();

/* =========================
   SAISON-VORMERKUNG
   Laub & Winterdienst
========================= */

(function(){

  /* --- Hier laesst sich die Aktion steuern, ohne Programmierkenntnisse ---
     SAISON_AN         : false schaltet das Fenster komplett ab
     SAISON_START_MONAT: ab welchem Monat es erscheint (8 = August)
     SAISON_ENDE_MONAT : bis einschliesslich welchem Monat (2 = Februar)
     VERZOEGERUNG_MS   : wie lange nach dem Oeffnen der Seite (300 = knapp sofort) */
  const SAISON_AN          = true;
  const SAISON_START_MONAT = 8;
  const SAISON_ENDE_MONAT  = 2;
  const VERZOEGERUNG_MS    = 300;

  const popup = document.getElementById('saisonPopup');
  if(!popup) return;

  const form = popup.querySelector('.season-form');
  function inSaison(){
    const monat = new Date().getMonth() + 1;

    if(SAISON_START_MONAT <= SAISON_ENDE_MONAT){
      return monat >= SAISON_START_MONAT && monat <= SAISON_ENDE_MONAT;
    }

    return monat >= SAISON_START_MONAT || monat <= SAISON_ENDE_MONAT;
  }

  function istGeoeffnet(){
    return popup.classList.contains('show');
  }

  function oeffnen(quelle){
    if(istGeoeffnet()) return;

    popup.classList.add('show');
    document.body.style.overflow = 'hidden';
    if(quelle === 'Automatisch') merken();

    const erstesFeld = form ? form.querySelector('input[name="E-Mail"]') : null;
    if(erstesFeld && window.innerWidth > 900) erstesFeld.focus();
  }

  function schliessen(quelle){
    if(!istGeoeffnet()) return;

    popup.classList.remove('show');
    document.body.style.overflow = '';
  }

  /* Banner-Button und jeder andere Ausloeser mit der Klasse season-open */
  document.querySelectorAll('.season-open').forEach(button => {
    button.addEventListener('click', function(){
      oeffnen('Banner');
    });
  });

  popup.querySelectorAll('.season-dismiss').forEach(button => {
    button.addEventListener('click', function(){
      schliessen('Später');
    });
  });

  /* Klick auf den Hintergrund schliesst, Klick in die Box nicht */
  popup.addEventListener('click', function(event){
    if(event.target === popup) schliessen('Hintergrund');
  });

  document.addEventListener('keydown', function(event){
    if(event.key === 'Escape') schliessen('Esc');
  });

  /* Nachricht-Feld befuellen, bevor das allgemeine Formular-Skript die Daten einsammelt.
     Laeuft in der Capture-Phase am document und damit garantiert vor dem Absende-Listener. */
  if(form){
    document.addEventListener('submit', function(event){
      if(event.target !== form) return;

      const einwilligung = form.querySelector('.season-consent');
      const nachricht = form.querySelector('input[name="Nachricht"]');
      if(!nachricht) return;

      const zeilen = [
        'Vormerkung über das Saison-Fenster (' + getPageSource() + ').',
        'Gewünscht: Winterdienst.',
        'Zeitpunkt: ' + new Date().toLocaleString('de-DE') + '.'
      ];

      if(einwilligung && einwilligung.checked){
        zeilen.push(
          'Einwilligung für künftige Saison-Angebote erteilt. Wortlaut: "Freiwillig: Ich möchte auch künftig ' +
          'Saison-Angebote per E-Mail erhalten. Diese Einwilligung kann ich jederzeit formlos widerrufen." ' +
          'Hinweis: Vor dem Versand von Werbe-E-Mails ist eine Bestätigung durch den Empfänger einzuholen.'
        );
      }else{
        zeilen.push('Keine Einwilligung für künftige Werbe-E-Mails – nur einmaliges Angebot zulässig.');
      }

      nachricht.value = zeilen.join(' ');
    }, true);

    /* Erst nach bestaetigter Speicherung schliessen, damit die gruene
       Bestaetigung frei liegt. Bei Fehlern bleibt das Fenster offen und
       die Angaben bleiben erhalten. */
    form.addEventListener('anfrage:gesendet', function(){
      merken();
      schliessen('');
    });
  }

  /* Einmal pro Besuch: Wer sich durch die Seiten klickt, soll das Fenster
     nicht bei jedem Wechsel erneut sehen. Gemerkt wird das nur im
     Sitzungsspeicher des Browsers - beim naechsten Besuch erscheint es wieder. */
  const GESEHEN = 'saison_popup_gesehen';

  function schonGesehen(){
    try{ return !!sessionStorage.getItem(GESEHEN); }catch(e){ return false; }
  }

  function merken(){
    try{ sessionStorage.setItem(GESEHEN, 'ja'); }catch(e){ /* privater Modus */ }
  }

  if(!SAISON_AN) return;
  if(!inSaison()) return;
  if(schonGesehen()) return;

  window.setTimeout(function(){
    const aktiv = document.activeElement;
    const tippt = aktiv && ['INPUT','TEXTAREA','SELECT'].indexOf(aktiv.tagName) !== -1;

    /* Niemand wird beim Ausfuellen des Kontaktformulars unterbrochen,
       und die Erfolgsmeldung wird nicht ueberdeckt. */
    if(tippt) return;

    const erfolgsPopup = document.getElementById('formPopup');
    if(erfolgsPopup && erfolgsPopup.classList.contains('show')) return;

    oeffnen('Automatisch');
  }, VERZOEGERUNG_MS);

})();

