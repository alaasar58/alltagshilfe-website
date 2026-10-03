/* Cookie-Banner (CookieConsent 3.1.0, selbst gehostet).
   Konservative Standardvariante: drei gleichwertige Schaltflaechen,
   nichts vorausgewaehlt, ohne Entscheidung keine Messung.
   Gespeichert wird nur die Entscheidung (Cookie cc_cookie, 182 Tage).
   Texte: Revision 1 (Wortlaut im internen Repository dokumentiert).
   Aenderung von Anbietern, Zwecken oder wesentlichen Texten: REVISION erhoehen,
   dann fragt das Banner alle Besucher erneut. */
(function(){
  'use strict';

  const REVISION = 1;

  if(!window.CookieConsent) return;

  /* Basis-Adresse der Website aus der eigenen Skript-Adresse, damit die
     Links auf jeder Ebene (/, /privat/, /privat/reinigung/) stimmen. */
  const skript = document.currentScript;
  const basis = skript ? skript.src.replace(/assets\/consent\.js(\?.*)?$/, '') : '/';

  function link(pfad, text){
    return '<a href="' + basis + pfad + '">' + text + '</a>';
  }

  /* Messung (assets/messung.js) informieren. Bei einem Widerruf wird die
     Seite immer neu geladen, damit nichts mehr nachlaeuft. */
  function melden(){
    window.dispatchEvent(new CustomEvent('einwilligung:geaendert'));
  }

  window.CookieConsent.run({
    revision: REVISION,
    mode: 'opt-in',
    autoShow: true,
    disablePageInteraction: false,
    hideFromBots: false,
    manageScriptTags: false,

    cookie: {
      name: 'cc_cookie',
      expiresAfterDays: 182,
      sameSite: 'Lax',
      useLocalStorage: false
    },

    guiOptions: {
      consentModal: {
        layout: 'box wide',
        position: 'bottom center',
        equalWeightButtons: true,
        flipButtons: false
      },
      preferencesModal: {
        layout: 'box',
        equalWeightButtons: true,
        flipButtons: false
      }
    },

    categories: {
      necessary: {
        enabled: true,
        readOnly: true
      },
      statistik: {
        autoClear: {
          cookies: [ { name: /^_ga/ } ],
          reloadPage: false
        }
      },
      marketing: {
        autoClear: {
          cookies: [ { name: /^_gcl/ } ],
          reloadPage: false
        }
      }
    },

    onConsent: melden,

    onChange: function(info){
      const widerrufen = info.changedCategories.some(function(kategorie){
        return !window.CookieConsent.acceptedCategory(kategorie);
      });
      if(widerrufen){
        window.location.reload();
        return;
      }
      melden();
    },

    language: {
      default: 'de',
      translations: {
        de: {
          /* Stufe 1: kurz (wie bei grossen Shops ueblich). Stufe 2: Einstellungen
             im selben Fenster. Stufe 3: Cookie-Richtlinie /cookies/. */
          consentModal: {
            title: 'Cookies',
            description:
              'Wir und unsere Partner verwenden Cookies, um unsere Website zu verbessern und ' +
              'die Wirkung unserer Werbung zu messen. Mehr dazu in unserer ' +
              link('cookies/', 'Cookie-Richtlinie') + '.',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Alle ablehnen',
            showPreferencesBtn: 'Einstellungen'
          },
          preferencesModal: {
            title: 'Cookie-Einstellungen',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Alle ablehnen',
            savePreferencesBtn: 'Auswahl speichern',
            closeIconLabel: 'Schließen ohne Speichern',
            sections: [
              {
                description: 'Sie können Ihre Auswahl jederzeit unten auf jeder Seite ändern.'
              },
              {
                title: 'Notwendig',
                description: 'Speichert Ihre Auswahl.',
                linkedCategory: 'necessary'
              },
              {
                title: 'Statistik – Google Analytics',
                description: 'Hilft uns zu verstehen, wie unsere Website genutzt wird.',
                linkedCategory: 'statistik'
              },
              {
                title: 'Marketing – Google Ads',
                description: 'Hilft uns, die Wirkung unserer Werbung zu messen.',
                linkedCategory: 'marketing'
              },
              {
                description: 'Mehr dazu in unserer ' + link('cookies/', 'Cookie-Richtlinie') + '.'
              }
            ]
          }
        }
      }
    }
  });
})();
