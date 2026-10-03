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

  /* Fuer die Ereignisse (naechster Schritt) und fuer Tests */
  window.ahsMessung = {
    stand: stand,
    gtmGeladen: function(){ return gtmGeladen; }
  };
})();
