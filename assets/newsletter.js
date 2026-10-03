/* Newsletter: Bestätigen oder Abmelden über einen Link aus der E-Mail.
   Die Seite ruft das Formular-Backend in einem unsichtbaren Rahmen auf;
   das Ergebnis kommt per postMessage zurück (wie bei den Formularen). */
(function(){
  'use strict';

  const TEXTE = {
    bestaetigt: ['Anmeldung bestätigt', 'Vielen Dank! Ihre Anmeldung zum Newsletter ist bestätigt. Jeder Newsletter enthält einen Link, mit dem Sie sich jederzeit wieder abmelden können.'],
    abgemeldet: ['Abgemeldet', 'Sie sind vom Newsletter abgemeldet und erhalten keine Newsletter mehr von uns.'],
    abgelaufen: ['Link abgelaufen', 'Dieser Bestätigungslink ist nicht mehr gültig. Sie können sich jederzeit erneut über ein Formular auf unserer Website anmelden.'],
    ungueltig: ['Link ungültig', 'Dieser Link ist leider ungültig. Bitte prüfen Sie, ob er vollständig ist.'],
    fehler: ['Das hat leider nicht geklappt', 'Bitte versuchen Sie es in einem Moment erneut oder schreiben Sie uns an info@service-alltagshilfe.de.']
  };
  const URSPRUNG = /^https:\/\/([a-z0-9-]+\.)*(googleusercontent\.com|script\.google\.com)$/;
  const TIMEOUT_MS = 20000;

  const titel = document.getElementById('nl-titel');
  const text = document.getElementById('nl-text');
  const daten = document.getElementById('nl-daten');

  function zeigen(schluessel){
    const t = TEXTE[schluessel] || TEXTE.ungueltig;
    titel.textContent = t[0];
    text.textContent = t[1];
  }

  const params = new URLSearchParams(window.location.search);
  const aktion = params.get('aktion');
  const token = params.get('token') || '';

  if((aktion !== 'bestaetigen' && aktion !== 'abmelden') || !/^[0-9a-f-]{36}$/i.test(token)){
    zeigen('ungueltig');
    return;
  }

  let fertig = false;
  const rahmen = document.createElement('iframe');
  rahmen.hidden = true;
  rahmen.title = 'Newsletter';

  const timer = setTimeout(function(){
    if(!fertig){ fertig = true; zeigen('fehler'); }
  }, TIMEOUT_MS);

  window.addEventListener('message', function(event){
    if(fertig || !URSPRUNG.test(event.origin)) return;
    const d = event.data;
    if(!d || d.typ !== 'alltagshilfe-newsletter') return;
    fertig = true;
    clearTimeout(timer);
    zeigen(d.ergebnis);
    rahmen.remove();
  });

  const ziel = new URL(daten.dataset.backend);
  ziel.searchParams.set('newsletter', aktion);
  ziel.searchParams.set('token', token);
  ziel.searchParams.set('antwort', 'iframe');
  ziel.searchParams.set('origin', window.location.origin);
  rahmen.src = ziel.toString();
  document.body.appendChild(rahmen);
})();
