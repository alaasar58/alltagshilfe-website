# Hinweise für die Arbeit an diesem Repository

Dieses Repository ist **öffentlich**. Es enthält ausschließlich die
statische Website von service-alltagshilfe.de (GitHub Pages).

## Was hierher gehört

- HTML-Seiten: `index.html`, `privat/`, `firmen/`, `stellen/`,
  `impressum/`, `datenschutz/`, `newsletter/` (Bestätigen/Abmelden)
- `assets/` (CSS, JavaScript) und `bilder/` (nur Bilder, die eine Seite
  tatsächlich verwendet)
- `robots.txt`, `sitemap.xml`, `CNAME`, `_config.yml`
- `.github/`, `.gitignore`, diese Datei

Alles andere wird von der Prüfung `oeffentlich-pruefen` abgelehnt.

## Was niemals hierher gehört

- Backend-Code (Apps Script), Tests, Pläne, Notizen, Auswertungen
- Unterlagen für rechtliche Prüfungen
- Kundendaten, Tabellen-IDs, private E-Mail-Adressen, Zugangsdaten
- Interne Dokumente jeder Art, auch nicht als Entwurf

Solche Dateien liegen im privaten Repository. Wenn eine Datei nicht
eindeutig zur ausgelieferten Website gehört: nicht hier ablegen.

## Arbeitsweise

- Änderungen nur über Pull Requests auf `main`; die Prüfung
  `oeffentlich-pruefen` muss grün sein.
- Rechtstexte (`impressum/`, `datenschutz/`) nur nach Freigabe ändern.
- Keine Force-Pushes, kein Umschreiben der Historie.
- Alle Links relativ halten (kein `href="/..."`), damit die Seite auch
  unter einer Unteradresse funktioniert.
- Formulare: Änderungen nicht mit echten Anfragen testen.
