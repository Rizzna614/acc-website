// scripts/generate-er-svg.js
// Generates a clean, high-resolution SVG ER diagram of the 3 tables and relationships.

const fs = require('fs');
const path = require('path');

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1150 780" width="1150" height="780" style="background:#f8fafc; font-family:'Segoe UI', system-ui, -apple-system, sans-serif;">
  <defs>
    <style>
      .title-box { fill: #1e293b; }
      .title-text { fill: #ffffff; font-weight: 700; font-size: 15px; }
      .row-even { fill: #ffffff; }
      .row-odd { fill: #f1f5f9; }
      .cell-border { stroke: #cbd5e1; stroke-width: 1; }
      .col-name { fill: #0f172a; font-size: 13px; font-weight: 500; }
      .col-type { fill: #64748b; font-size: 12px; font-family: monospace; }
      .pk-icon { fill: #eab308; font-weight: 800; font-size: 11px; }
      .fk-icon { fill: #3b82f6; font-weight: 800; font-size: 11px; }
      .rel-line { stroke: #0284c7; stroke-width: 2.5; fill: none; }
      .rel-marker { fill: #0284c7; }
    </style>
    <marker id="crow" viewBox="0 0 20 20" refX="10" refY="10" markerWidth="12" markerHeight="12" orient="auto-start-reverse">
      <path d="M 0 0 L 10 10 L 0 20 M 10 0 L 20 10 L 10 20" fill="none" stroke="#0284c7" stroke-width="2.5" />
    </marker>
    <marker id="one" viewBox="0 0 20 20" refX="10" refY="10" markerWidth="12" markerHeight="12" orient="auto-start-reverse">
      <line x1="10" y1="2" x2="10" y2="18" stroke="#0284c7" stroke-width="2.5" />
      <line x1="15" y1="2" x2="15" y2="18" stroke="#0284c7" stroke-width="2.5" />
    </marker>
  </defs>

  <!-- Canvas Header -->
  <rect x="0" y="0" width="1150" height="70" fill="#0f172a" />
  <text x="40" y="42" fill="#ffffff" font-size="22" font-weight="700">Assetto Corsa Competizione (ACC) – ER Diagramma</text>
  <text x="40" y="60" fill="#94a3b8" font-size="13">MySQL datubāzes struktūra (1. normālforma, 3 jēgpilnas tabulas ar 1:N saitēm)</text>

  <!-- ==================== TABLE 1: game_info ==================== -->
  <g transform="translate(40, 110)">
    <!-- Header -->
    <rect class="title-box" x="0" y="0" width="340" height="38" rx="6" ry="6" />
    <rect class="title-box" x="0" y="20" width="340" height="18" />
    <text class="title-text" x="16" y="24">⊞ game_info (Par spēli)</text>

    <!-- Rows -->
    <!-- id -->
    <rect class="row-even cell-border" x="0" y="38" width="340" height="30" />
    <text class="pk-icon" x="12" y="58">PK</text>
    <text class="col-name" x="42" y="58">id</text>
    <text class="col-type" x="220" y="58">INT [AI]</text>

    <!-- name -->
    <rect class="row-odd cell-border" x="0" y="68" width="340" height="30" />
    <text class="col-name" x="42" y="88">name</text>
    <text class="col-type" x="220" y="88">VARCHAR(100)</text>

    <!-- developer -->
    <rect class="row-even cell-border" x="0" y="98" width="340" height="30" />
    <text class="col-name" x="42" y="118">developer</text>
    <text class="col-type" x="220" y="118">VARCHAR(100)</text>

    <!-- publisher -->
    <rect class="row-odd cell-border" x="0" y="128" width="340" height="30" />
    <text class="col-name" x="42" y="148">publisher</text>
    <text class="col-type" x="220" y="148">VARCHAR(100)</text>

    <!-- genre -->
    <rect class="row-even cell-border" x="0" y="158" width="340" height="30" />
    <text class="col-name" x="42" y="178">genre</text>
    <text class="col-type" x="220" y="178">VARCHAR(100)</text>

    <!-- release_year -->
    <rect class="row-odd cell-border" x="0" y="188" width="340" height="30" />
    <text class="col-name" x="42" y="208">release_year</text>
    <text class="col-type" x="220" y="208">INT</text>

    <!-- platform (1NF) -->
    <rect class="row-even cell-border" x="0" y="218" width="340" height="30" />
    <text class="col-name" x="42" y="238">platform</text>
    <text class="col-type" x="220" y="238">VARCHAR(50)</text>

    <!-- short_description -->
    <rect class="row-odd cell-border" x="0" y="248" width="340" height="30" />
    <text class="col-name" x="42" y="268">short_description</text>
    <text class="col-type" x="220" y="268">VARCHAR(300)</text>

    <!-- description -->
    <rect class="row-even cell-border" x="0" y="278" width="340" height="30" />
    <text class="col-name" x="42" y="298">description</text>
    <text class="col-type" x="220" y="298">TEXT</text>

    <!-- main_image -->
    <rect class="row-odd cell-border" x="0" y="308" width="340" height="30" rx="0" ry="0" />
    <text class="col-name" x="42" y="328">main_image</text>
    <text class="col-type" x="220" y="328">VARCHAR(255)</text>

    <rect x="0" y="338" width="340" height="1" fill="#cbd5e1" />
  </g>

  <!-- ==================== TABLE 2: news ==================== -->
  <g transform="translate(680, 110)">
    <!-- Header -->
    <rect class="title-box" x="0" y="0" width="350" height="38" rx="6" ry="6" />
    <rect class="title-box" x="0" y="20" width="350" height="18" />
    <text class="title-text" x="16" y="24">⊞ news (Ziņas un raksti)</text>

    <!-- id -->
    <rect class="row-even cell-border" x="0" y="38" width="350" height="30" />
    <text class="pk-icon" x="12" y="58">PK</text>
    <text class="col-name" x="42" y="58">id</text>
    <text class="col-type" x="225" y="58">INT [AI]</text>

    <!-- game_id (FK) -->
    <rect class="row-odd cell-border" x="0" y="68" width="350" height="30" />
    <text class="fk-icon" x="12" y="88">FK</text>
    <text class="col-name" x="42" y="88">game_id</text>
    <text class="col-type" x="225" y="88">INT</text>

    <!-- category (1NF) -->
    <rect class="row-even cell-border" x="0" y="98" width="350" height="30" />
    <text class="col-name" x="42" y="118">category</text>
    <text class="col-type" x="225" y="118">VARCHAR(50)</text>

    <!-- title -->
    <rect class="row-odd cell-border" x="0" y="128" width="350" height="30" />
    <text class="col-name" x="42" y="148">title</text>
    <text class="col-type" x="225" y="148">VARCHAR(150)</text>

    <!-- description -->
    <rect class="row-even cell-border" x="0" y="158" width="350" height="30" />
    <text class="col-name" x="42" y="178">description</text>
    <text class="col-type" x="225" y="178">VARCHAR(300)</text>

    <!-- content -->
    <rect class="row-odd cell-border" x="0" y="188" width="350" height="30" />
    <text class="col-name" x="42" y="208">content</text>
    <text class="col-type" x="225" y="208">TEXT</text>

    <!-- image -->
    <rect class="row-even cell-border" x="0" y="218" width="350" height="30" />
    <text class="col-name" x="42" y="238">image</text>
    <text class="col-type" x="225" y="238">VARCHAR(255)</text>

    <!-- date -->
    <rect class="row-odd cell-border" x="0" y="248" width="350" height="30" />
    <text class="col-name" x="42" y="268">date</text>
    <text class="col-type" x="225" y="268">DATE</text>

    <rect x="0" y="278" width="350" height="1" fill="#cbd5e1" />
  </g>

  <!-- ==================== TABLE 3: gallery ==================== -->
  <g transform="translate(680, 480)">
    <!-- Header -->
    <rect class="title-box" x="0" y="0" width="350" height="38" rx="6" ry="6" />
    <rect class="title-box" x="0" y="20" width="350" height="18" />
    <text class="title-text" x="16" y="24">⊞ gallery (Galerija)</text>

    <!-- id -->
    <rect class="row-even cell-border" x="0" y="38" width="350" height="30" />
    <text class="pk-icon" x="12" y="58">PK</text>
    <text class="col-name" x="42" y="58">id</text>
    <text class="col-type" x="225" y="58">INT [AI]</text>

    <!-- game_id (FK) -->
    <rect class="row-odd cell-border" x="0" y="68" width="350" height="30" />
    <text class="fk-icon" x="12" y="88">FK</text>
    <text class="col-name" x="42" y="88">game_id</text>
    <text class="col-type" x="225" y="88">INT</text>

    <!-- title -->
    <rect class="row-even cell-border" x="0" y="98" width="350" height="30" />
    <text class="col-name" x="42" y="118">title</text>
    <text class="col-type" x="225" y="118">VARCHAR(100)</text>

    <!-- description -->
    <rect class="row-odd cell-border" x="0" y="128" width="350" height="30" />
    <text class="col-name" x="42" y="148">description</text>
    <text class="col-type" x="225" y="148">VARCHAR(500)</text>

    <!-- image -->
    <rect class="row-even cell-border" x="0" y="158" width="350" height="30" />
    <text class="col-name" x="42" y="178">image</text>
    <text class="col-type" x="225" y="178">VARCHAR(255)</text>

    <rect x="0" y="188" width="350" height="1" fill="#cbd5e1" />
  </g>

  <!-- ==================== RELATIONSHIP LINES ==================== -->
  <!-- Line 1: game_info.id (1) -> news.game_id (N) -->
  <path d="M 380 163 C 510 163, 530 198, 680 198" class="rel-line" marker-start="url(#one)" marker-end="url(#crow)" />
  <rect x="500" y="166" width="60" height="20" rx="4" fill="#e0f2fe" stroke="#38bdf8" />
  <text x="508" y="180" fill="#0369a1" font-size="11" font-weight="600">1 : N</text>

  <!-- Line 2: game_info.id (1) -> gallery.game_id (N) -->
  <path d="M 380 163 C 480 163, 520 568, 680 568" class="rel-line" marker-start="url(#one)" marker-end="url(#crow)" />
  <rect x="500" y="360" width="60" height="20" rx="4" fill="#e0f2fe" stroke="#38bdf8" />
  <text x="508" y="374" fill="#0369a1" font-size="11" font-weight="600">1 : N</text>

  <!-- Footer Legend -->
  <g transform="translate(40, 520)">
    <rect x="0" y="0" width="340" height="150" rx="8" fill="#ffffff" stroke="#cbd5e1" />
    <text x="16" y="26" font-size="13" font-weight="700" fill="#0f172a">Apzīmējumi &amp; Paskaidrojumi</text>
    <circle cx="24" cy="50" r="6" fill="#eab308" />
    <text x="38" y="54" font-size="12" fill="#334155"><tspan font-weight="700">PK</tspan> — Primārā atslēga (Primary Key)</text>

    <circle cx="24" cy="76" r="6" fill="#3b82f6" />
    <text x="38" y="80" font-size="12" fill="#334155"><tspan font-weight="700">FK</tspan> — Ārējā atslēga (Foreign Key)</text>

    <line x1="16" y1="102" x2="32" y2="102" stroke="#0284c7" stroke-width="2" />
    <text x="38" y="106" font-size="12" fill="#334155"><tspan font-weight="700">1 : N</tspan> — Viens pret daudziem (One-to-Many)</text>

    <text x="16" y="132" font-size="11" fill="#64748b">1NF: Katrā laukā glabājas tikai atomāra viena vērtība.</text>
  </g>
</svg>
`;

const outputPath = path.join(__dirname, '..', 'database', 'er_diagram.svg');
fs.writeFileSync(outputPath, svgContent, 'utf8');
console.log('ER Diagram SVG generated at:', outputPath);
