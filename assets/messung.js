/* Messung mit Google Consent Mode v2 (Basic Mode).
   - Standard: alles abgelehnt. Vor einer Einwilligung wird nichts geladen
     und nichts gesendet; der dataLayer enthaelt nur die Consent-Befehle.
   - Der Google Tag Manager wird erst geladen, wenn Statistik oder Marketing
     erteilt ist, und nur wenn GTM_ID gesetzt ist.
   - Die Einwilligung wird bei jeder Pruefung frisch aus dem Banner gelesen.
   Wird VOR consent.js eingebunden, nur auf den Seiten mit Messung (nicht auf
   Impressum, Datenschutz, Newsletter). */
(function(){
  'use strict';

  /* Leer = Messung aus (Banner funktioniert trotzdem). Erst nach Freigabe
     eintragen, z. B. 'GTM-ABC1234'. */
  const GTM_ID = 'GTM-WPBZ7XX5';

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted'
  });
  gtag('set', 'ads_data_redaction', true);

  let gtmGeladen = false;
  let angewendet = { statistik: false, marketing: false };

  function stand(){
    const cc = window.CookieConsent;
    return {
      statistik: !!(cc && cc.acceptedCategory('statistik')),
      marketing: !!(cc && cc.acceptedCategory('marketing'))
    };
  }

  function gtmLaden(){
    if(gtmGeladen || !/^GTM-[A-Z0-9]+$/.test(GTM_ID)) return;
    gtmGeladen = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID);
    document.head.appendChild(s);
  }

  function anwenden(){
    const s = stand();
    /* Nur wenn etwas erteilt ist, gibt es ueberhaupt ein Update. */
    if(!s.statistik && !s.marketing && !angewendet.statistik && !angewendet.marketing) return;

    gtag('consent', 'update', {
      analytics_storage: s.statistik ? 'granted' : 'denied',
      ad_storage: s.marketing ? 'granted' : 'denied',
      ad_user_data: s.marketing ? 'granted' : 'denied'
    });
    angewendet = s;

    if(s.statistik || s.marketing) gtmLaden();
  }

  window.addEventListener('einwilligung:geaendert', anwenden);

  /* Zurueck-Taste (bfcache): Einwilligung neu lesen. Wurde inzwischen in
     einem anderen Tab etwas widerrufen, wird die Seite neu geladen. */
  window.addEventListener('pageshow', function(event){
    if(!event.persisted) return;
    const s = stand();
    if((angewendet.statistik && !s.statistik) || (angewendet.marketing && !s.marketing)){
      window.location.reload();
    }
  });

  /* ---------- Ereignisse ----------
     Nur mit erteilter Einwilligung (Statistik oder Marketing), sonst
     verworfen (keine rueckwirkende Messung). Jedes Ereignis traegt den
     Einwilligungsstand zum Zeitpunkt des Ereignisses; GTM entscheidet damit,
     ob GA4 (Statistik) bzw. Google Ads (Marketing) es bekommt.
     Keine Formularinhalte, keine Telefonnummern oder Links. */

  function seitenGruppe(){
    const teil = window.location.pathname.split('/').filter(Boolean)[0] || '';
    if(teil === 'privat' || teil === 'firmen') return teil;
    if(teil === 'stellen') return 'jobs';
    return 'start';
  }

  function melden(name, daten){
    const s = stand();
    if(!s.statistik && !s.marketing) return;
    window.dataLayer.push(Object.assign({
      event: name,
      page_group: seitenGruppe(),
      einwilligung_statistik: s.statistik,
      einwilligung_marketing: s.marketing
    }, daten));
  }

  /* Bestaetigte Anfrage aus dem Formular (seite.js); jede request_id nur
     einmal je Seite */
  const gemeldet = new Set();
  document.addEventListener('anfrage:gesendet', function(event){
    const d = event.detail || {};
    if(!d.request_id || d.duplicate || gemeldet.has(d.request_id)) return;
    gemeldet.add(d.request_id);
    melden(d.form_variant === 'saison' ? 'season_reminder_signup' : 'generate_lead', {
      request_id: d.request_id,
      customer_type: d.form_type === 'firmen' ? 'firmen' : 'privat',
      form_variant: d.form_variant === 'saison' ? 'saison' : 'anfrage'
    });
  });

  /* Klick auf Telefon, WhatsApp oder E-Mail */
  document.addEventListener('click', function(event){
    const link = event.target.closest && event.target.closest('a[href]');
    if(!link) return;
    const href = link.getAttribute('href');
    let weg = '';
    if(/^tel:/i.test(href)) weg = 'telefon';
    else if(/^mailto:/i.test(href)) weg = 'email';
    else if(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) weg = 'whatsapp';
    if(!weg) return;
    melden(seitenGruppe() === 'jobs' ? 'job_apply_click' : 'contact_click', { contact_method: weg });
  }, true);

  /* Fuer Tests */
  window.ahsMessung = {
    stand: stand,
    gtmGeladen: function(){ return gtmGeladen; }
  };
})();
