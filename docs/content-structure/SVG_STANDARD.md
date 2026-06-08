# Deepscroll — SVG Design Standard

Verbindliche Vorlage für alle Inline-SVG-Grafiken in Deepscroll (vor allem `concepts`, optional `facts`). Ziel: hunderte Grafiken, die über den ganzen Feed hinweg **einheitlich** wirken, **themenspezifisch** sind und in **Dark- und White-Mode** ohne Nacharbeit funktionieren.

Diese Datei dient zwei Zwecken:
1. Als Referenz beim Erzeugen der SVGs (Deep Research / Generierung).
2. Als Referenz für Claude Code, damit das Frontend die SVGs korrekt einbettet und spätere Contributors den Stil treffen.

---

## 1. Technische Grundregeln (gelten für JEDES SVG)

- **viewBox immer `0 0 400 300`.** Nichts außerhalb dieser Box zeichnen. Labels am Rand brauchen Innenabstand (mind. 8px), sonst werden sie abgeschnitten.
- **Kein `width`/`height` am `<svg>`** — nur die viewBox. Die Größe steuert das Frontend per CSS.
- **Hintergrund immer transparent.** Kein `<rect>` als Hintergrund. Die Karte scheint durch.
- **`fill="none"` am `<svg>`-Element** als Default; Flächen nur dort, wo bewusst gewollt.
- **Flat only:** keine Schatten, keine Filter, keine 3D-Effekte, keine Verläufe (`gradient`) innerhalb von Formen.
- **Strokes als Default**, nicht Fills — wirkt leichter auf dunklem Grund.
- **`stroke-width`** zwischen 2 und 2.5 für Hauptelemente, 1.5–2 für Hilfslinien.
- **`stroke-linecap="round"` und `stroke-linejoin="round"`** überall — weiche, moderne Anmutung.
- **Schrift:** `font-family="system-ui, sans-serif"`, `font-weight` 600–700 für Labels, `font-size` 11–15. Text immer kurz (1–2 Wörter pro Label).
- **`text-anchor="middle"`** für zentrierte Labels; Randlabels bewusst positionieren und im Innenraum halten.

---

## 2. Theme-Regel (Dark + White Mode ohne Neugenerierung)

Das ist die wichtigste Regel. Jedes SVG trennt **zwei Farbrollen**:

- **Neutrale Elemente** (Text, Hilfslinien, Strukturlinien): immer **`currentColor`**.
  `currentColor` erbt die Textfarbe des Containers. Das Frontend setzt diese je nach Theme — hell im Dark Mode, dunkel im White Mode. Das SVG passt sich automatisch an, ohne dass es neu erzeugt werden muss.
- **Akzent-Element** (das eine hervorgehobene Diagramm-Element): **feste Akzentfarbe** des jeweiligen Formats (siehe unten). Diese Farben funktionieren auf hellem wie dunklem Grund, bleiben also fest.

Praktisch:
- Strukturlinien, Pfeile, Beschriftungen → `stroke="currentColor"` bzw. `fill="currentColor"` (gern mit `opacity` 0.4–0.7 für Hilfslinien).
- Das hervorgehobene Element (der Kern der Aussage) → feste Akzentfarbe, z.B. `stroke="#a78bfa"`.

So ist die App später mit einem einzigen Theme-Switch umstellbar.

---

## 3. Akzentfarben pro Format

Jedes SVG nutzt die Akzentfarbe seines Formats, damit die Grafik farblich zur Karte gehört:

| Format    | Farbe       | Hex       |
|-----------|-------------|-----------|
| concepts  | violet-400  | `#a78bfa` |
| facts     | cyan-400    | `#22d3ee` |
| books     | amber-400   | `#fbbf24` |
| people    | rose-400    | `#fb7185` |
| questions | emerald-400 | `#34d399` |
| stories   | orange-400  | `#fb923c` |

(In der Praxis tragen fast nur `concepts` (violett) und gelegentlich `facts` (cyan) ein SVG. Die Tabelle gilt aber generell.)

---

## 4. Die Diagramm-Typen (Baukasten)

Sechs Standardtypen decken die meisten Konzepte ab. Das `details.visual_type`-Feld benennt den Typ. **Keine harte Grenze:** passt kein Typ, darf ein freies SVG gebaut werden — solange es allen Regeln aus Abschnitt 1–3 folgt.

Alle Beispiele unten sind validiert und nutzen Violett (`#a78bfa`) als Beispiel-Akzent. Beim Einsatz die Akzentfarbe an das Format anpassen.

### 4.1 `cycle` — Kreislauf
Für sich wiederholende Prozesse (z.B. Habit Loop: Cue → Routine → Reward).

```svg
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" fill="none">
  <g stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round">
    <circle cx="200" cy="70" r="42"/>
    <circle cx="110" cy="215" r="42"/>
    <circle cx="290" cy="215" r="42"/>
  </g>
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.55">
    <path d="M168 108 Q120 140 96 178"/>
    <path d="M96 178 l-3 -14 m3 14 l13 -6"/>
    <path d="M152 230 Q200 250 248 230"/>
    <path d="M248 230 l-13 -5 m13 5 l-2 14"/>
    <path d="M304 178 Q280 140 232 108"/>
    <path d="M232 108 l14 2 m-14 -2 l5 13"/>
  </g>
  <g fill="currentColor" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">
    <text x="200" y="75">Cue</text>
    <text x="110" y="220">Routine</text>
    <text x="290" y="220">Reward</text>
  </g>
</svg>
```

### 4.2 `flow` — Ablauf / Pfeilkette
Für lineare Abläufe oder Ursache→Wirkung (z.B. First Principles: Assume → Break down → Rebuild).

```svg
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" fill="none">
  <g stroke="#a78bfa" stroke-width="2.5">
    <rect x="30" y="120" width="90" height="60" rx="10"/>
    <rect x="155" y="120" width="90" height="60" rx="10"/>
    <rect x="280" y="120" width="90" height="60" rx="10"/>
  </g>
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.55">
    <path d="M120 150 h35"/>
    <path d="M155 150 l-12 -6 m12 6 l-12 6"/>
    <path d="M245 150 h35"/>
    <path d="M280 150 l-12 -6 m12 6 l-12 6"/>
  </g>
  <g fill="currentColor" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">
    <text x="75" y="155">Assume</text>
    <text x="200" y="155">Break down</text>
    <text x="325" y="155">Rebuild</text>
  </g>
</svg>
```

### 4.3 `comparison` — Gegenüberstellung
Für Konzepte die auf Kontrast beruhen (z.B. Fixed vs Growth Mindset).

```svg
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" fill="none">
  <line x1="200" y1="40" x2="200" y2="260" stroke="currentColor" stroke-width="1.5" opacity="0.3" stroke-dasharray="6 6"/>
  <g stroke="#a78bfa" stroke-width="2.5">
    <rect x="40" y="70" width="120" height="160" rx="12"/>
    <rect x="240" y="70" width="120" height="160" rx="12"/>
  </g>
  <g fill="currentColor" font-family="system-ui, sans-serif" text-anchor="middle">
    <text x="100" y="105" font-size="15" font-weight="700">Fixed</text>
    <text x="300" y="105" font-size="15" font-weight="700">Growth</text>
    <g font-size="12" opacity="0.8">
      <text x="100" y="150">Avoids</text>
      <text x="100" y="172">challenge</text>
      <text x="300" y="150">Seeks</text>
      <text x="300" y="172">challenge</text>
    </g>
  </g>
</svg>
```

### 4.4 `matrix` — 2×2 Quadranten
Für Konzepte mit zwei Achsen (z.B. Eisenhower-Matrix). **Achtung:** Achsenbeschriftungen am Rand im Innenraum halten, sonst Abschnitt — Randlabels max. bis x≈350 / mit `text-anchor` so setzen, dass sie nicht über die viewBox hinausragen.

```svg
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" fill="none">
  <g stroke="currentColor" stroke-width="2" opacity="0.5">
    <line x1="200" y1="50" x2="200" y2="250"/>
    <line x1="70" y1="150" x2="350" y2="150"/>
  </g>
  <rect x="202" y="52" width="146" height="96" rx="8" fill="#a78bfa" opacity="0.12"/>
  <g fill="currentColor" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" opacity="0.85">
    <text x="135" y="105">Do now</text>
    <text x="275" y="105">Schedule</text>
    <text x="135" y="205">Delegate</text>
    <text x="275" y="205">Delete</text>
  </g>
  <g fill="currentColor" font-family="system-ui, sans-serif" font-size="11" font-weight="600" opacity="0.6">
    <text x="200" y="42" text-anchor="middle">Important</text>
    <text x="345" y="138" text-anchor="end">Urgent</text>
  </g>
</svg>
```

### 4.5 `scale` — Skala / Spektrum
Für graduelle Konzepte (z.B. Overton-Fenster).

```svg
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect x="50" y="140" width="300" height="14" rx="7" stroke="currentColor" stroke-width="2" opacity="0.4"/>
  <rect x="170" y="137" width="90" height="20" rx="10" fill="#a78bfa" opacity="0.25" stroke="#a78bfa" stroke-width="2"/>
  <g fill="currentColor" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">
    <text x="60" y="185" opacity="0.7">Unthinkable</text>
    <text x="215" y="120" font-weight="700">Acceptable</text>
    <text x="340" y="185" opacity="0.7">Policy</text>
  </g>
</svg>
```

### 4.6 `pyramid` — Hierarchie / Schichten
Für aufeinander aufbauende Ebenen (z.B. Maslow). Spitzentext kurz halten (passt sonst nicht in die schmale Spitze).

```svg
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" fill="none">
  <g stroke="#a78bfa" stroke-width="2.5" stroke-linejoin="round">
    <path d="M200 50 L255 130 L145 130 Z"/>
    <path d="M145 130 L275 130 L300 200 L120 200 Z"/>
    <path d="M120 200 L300 200 L325 270 L95 270 Z"/>
  </g>
  <g fill="currentColor" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle">
    <text x="200" y="108" font-size="10">Self-actual.</text>
    <text x="210" y="172" opacity="0.85">Esteem</text>
    <text x="210" y="242" opacity="0.7">Basic needs</text>
  </g>
</svg>
```

---

## 5. Frontend-Einbettung (für Claude Code)

- Das SVG kommt als roher String aus `details.visual_svg` und wird inline gerendert (in React über `dangerouslySetInnerHTML` auf einem Wrapper-`<div>`, oder serverseitig sanitisiert).
- **Sicherheit:** SVGs stammen aus der eigenen Content-Pipeline (nicht von Nutzern), trotzdem vor dem Rendern sanitizen (z.B. DOMPurify mit SVG-Profil), um `<script>` o.Ä. auszuschließen. Falls Nutzer später eigene Inhalte beitragen, ist Sanitizing Pflicht.
- **Theme-Kopplung:** Der Wrapper setzt `color:` auf die gewünschte neutrale Farbe (Dark Mode: z.B. `#e4e4e7`; White Mode: z.B. `#18181b`). Dadurch greift `currentColor` im SVG automatisch.
- Wrapper bekommt eine feste Breite (z.B. `max-width: 360px`, zentriert), das SVG skaliert per `width:100%; height:auto`.
- Transparenter Hintergrund — nie eine Hintergrundfläche hinter dem SVG setzen, der Karten-Gradient soll durchscheinen.

---

## 6. Checkliste vor dem Speichern eines SVG

- [ ] `viewBox="0 0 400 300"`, kein width/height
- [ ] Nichts ragt aus der viewBox (besonders Randlabels)
- [ ] Neutrale Elemente nutzen `currentColor`
- [ ] Genau eine feste Akzentfarbe, passend zum Format
- [ ] Kein Hintergrund-Rechteck, `fill="none"` am Root
- [ ] Keine Schatten/Filter/Verläufe
- [ ] `stroke-linecap`/`linejoin` round
- [ ] Labels kurz (1–2 Wörter), `system-ui`
- [ ] Rendert fehlerfrei (valide Syntax)

---

*Ein SVG, beide Themes. Konsistenter Stil, themenspezifischer Inhalt.*
