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
          consentModal: {
            title: 'Ihre Datenschutz-Einstellungen',
            description:
              'Mit Ihrer Einwilligung nutzen wir Google Analytics (Statistik) und die ' +
              'Conversion-Messung von Google Ads (Marketing), jeweils über den Google Tag Manager. ' +
              'Damit sehen wir, wie unsere Website genutzt wird und ob Anfragen über unsere Anzeigen ' +
              'zustande kommen. Dafür werden Cookies gespeichert und Daten an Google übermittelt, ' +
              'auch in die USA. Die Nutzung ist freiwillig; wenn Sie ablehnen, können Sie die Website ' +
              'ohne Einschränkung nutzen. Ihre Auswahl können Sie jederzeit über ' +
              '„Cookie-Einstellungen“ unten auf jeder Seite ändern oder widerrufen.',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Alle ablehnen',
            showPreferencesBtn: 'Einstellungen',
            footer: link('datenschutz/', 'Datenschutzerklärung') + link('impressum/', 'Impressum')
          },
          preferencesModal: {
            title: 'Cookie-Einstellungen',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Alle ablehnen',
            savePreferencesBtn: 'Auswahl speichern',
            closeIconLabel: 'Schließen ohne Speichern',
            serviceCounterLabel: 'Dienst|Dienste',
            sections: [
              {
                description:
                  'Hier legen Sie fest, was wir verwenden dürfen. Statistik und Marketing sind ' +
                  'ausgeschaltet, bis Sie sie einschalten. „Alle akzeptieren“ schaltet beides ein, ' +
                  '„Alle ablehnen“ beides aus.'
              },
              {
                title: 'Notwendig',
                description:
                  'Speichert nur Ihre Auswahl in diesem Fenster, damit wir Sie nicht bei jedem ' +
                  'Seitenaufruf erneut fragen. Kein Tracking.',
                linkedCategory: 'necessary',
                cookieTable: {
                  headers: { name: 'Cookie', anbieter: 'Anbieter', zweck: 'Zweck', dauer: 'Speicherdauer' },
                  body: [
                    { name: 'cc_cookie', anbieter: 'AlltagsHilfe Service', zweck: 'Ihre Auswahl im Cookie-Banner', dauer: '6 Monate' }
                  ]
                }
              },
              {
                title: 'Statistik',
                description:
                  'Google Analytics 4 über den Google Tag Manager. Anbieter: Google Ireland Limited, ' +
                  'Gordon House, Barrow Street, Dublin 4, Irland. Zweck: Wir sehen zusammengefasst, ' +
                  'welche Seiten besucht werden und ob Anfragen über die Website gesendet werden – ' +
                  'ohne Formularinhalte. Eine Übermittlung an Google LLC in den USA ist möglich ' +
                  '(EU-US Data Privacy Framework).',
                linkedCategory: 'statistik',
                cookieTable: {
                  headers: { name: 'Cookie', anbieter: 'Anbieter', zweck: 'Zweck', dauer: 'Speicherdauer' },
                  body: [
                    { name: '_ga', anbieter: 'Google', zweck: 'unterscheidet Besuche', dauer: '2 Jahre' },
                    { name: '_ga_…', anbieter: 'Google', zweck: 'speichert den Sitzungsstand', dauer: '2 Jahre' }
                  ]
                }
              },
              {
                title: 'Marketing',
                description:
                  'Conversion-Messung von Google Ads über den Google Tag Manager. Anbieter: Google ' +
                  'Ireland Limited (siehe oben). Zweck: Wir messen, ob eine Anfrage oder ein Klick auf ' +
                  'Telefon, WhatsApp oder E-Mail auf eine unserer Anzeigen zurückgeht. Keine ' +
                  'personalisierte Werbung. Eine Übermittlung an Google LLC in den USA ist möglich ' +
                  '(EU-US Data Privacy Framework).',
                linkedCategory: 'marketing',
                cookieTable: {
                  headers: { name: 'Cookie', anbieter: 'Anbieter', zweck: 'Zweck', dauer: 'Speicherdauer' },
                  body: [
                    { name: '_gcl_au', anbieter: 'Google', zweck: 'ordnet Anfragen Anzeigen zu', dauer: '90 Tage' },
                    { name: '_gcl_aw', anbieter: 'Google', zweck: 'speichert den Anzeigen-Klick', dauer: '90 Tage' }
                  ]
                }
              },
              {
                title: 'Mehr Informationen',
                description:
                  'Einzelheiten, Ihre Rechte und den Widerruf finden Sie in unserer ' +
                  link('datenschutz/', 'Datenschutzerklärung') + '.'
              }
            ]
          }
        }
      }
    }
  });
})();
