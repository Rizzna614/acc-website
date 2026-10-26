# MySQL Datubāzes Dokumentācija un ER Diagramma

Šis dokuments un pievienotie faili ir sagatavoti atbilstoši uzdevuma specifikācijai:
**"MySQL datubāzes izveide un ER diagrammas ģenerēšana"**.

---

## 1. Datu plānošana un 1. normālforma (1NF)

| Tabula | Glabājamie lauki un nozīme | 1NF un ierobežojumi |
| :--- | :--- | :--- |
| **`game_info`** (Par spēli) | `id` (PK), `name`, `developer`, `publisher`, `genre`, `release_year`, `platform`, `short_description`, `description`, `main_image` | **1NF**: `platform` satur vienu atomāru vērtību (`PC`), nevis komatiem atdalītu tekstu. `main_image` glabā attēla ceļu. |
| **`news`** (Ziņas un raksti) | `id` (PK), `game_id` (FK), `category`, `title`, `description`, `content`, `image`, `date` | **1NF**: `category` satur vienu atomāru kategoriju katram rakstam. Piesaistīta spēlei caur `game_id`. |
| **`gallery`** (Galerija) | `id` (PK), `game_id` (FK), `title`, `description`, `image` | Glabā attēla lokāciju / URL ceļu, nevis pašu bināro failu. Piesaistīta spēlei caur `game_id`. |

---

## 2. Tabulu attiecības (Relācijas)

- **`game_info` (1) ───< (N) `news`**:
  Vienai spēlei ir piesaistīti vairāki jaunumi un raksti.
  Ārējā atslēga: `news.game_id` norāda uz `game_info.id` ar `ON DELETE CASCADE ON UPDATE CASCADE`.
- **`game_info` (1) ───< (N) `gallery`**:
  Vienai spēlei ir piesaistīti vairāki galerijas attēli.
  Ārējā atslēga: `gallery.game_id` norāda uz `game_info.id` ar `ON DELETE CASCADE ON UPDATE CASCADE`.

---

## 3. Datu apjoms un atbilstība prasībām

- **Spēles informācija**: Assetto Corsa Competizione pilns apraksts, izstrādātājs, izdevējs, gads, platforma un galvenais attēls.
- **Ziņu ieraksti**: **5 reālistiski ieraksti** (atbilst prasībai "vismaz pieci"):
  1. *Welcome to the ACC fan site* (Kategorija: Site news)
  2. *What is Balance of Performance?* (Kategorija: Guide)
  3. *GT3 vs GT4: what is the difference?* (Kategorija: Guide)
  4. *Physics and Tyre Model 1.9 Overview* (Kategorija: Update)
  5. *SRO Esports Championship Season Announced* (Kategorija: Esports)
- **Galerijas ieraksti**: **5 reālistiski ieraksti** (atbilst prasībai "vismaz pieci"):
  1. *Golden hour at Monza*
  2. *Rain at Spa*
  3. *Night race*
  4. *Side by side*
  5. *Sunset over Nürburgring GP*

---

## 4. Kā ģenerēt `.mwb` failu un PDF/PNG ER diagrammu ar MySQL Workbench

Uzdevuma 5. punktā prasītie iesniedzamie materiāli ir:
1. **SQL fails**: pieejams šeit: [`database/schema_mysql.sql`](schema_mysql.sql).
2. **ER diagramma attēla formātā**: ģenerēts vektora SVG fails [`database/er_diagram.svg`](er_diagram.svg).
3. **MySQL Workbench modeļa fails (`.mwb`)**:

### Solis pa solim MySQL Workbench (bez nepieciešamības pēc aktīva servera):
1. Atveriet **MySQL Workbench**.
2. Izvēlnē izvēlieties: **File → Import → Reverse Engineer MySQL Create Script...** (saīsne: `Ctrl + Shift + R`).
3. Logā norādiet failu:
   `c:\Users\User\RRazna\acc-website\database\schema_mysql.sql`
4. Ieķeksējiet opciju **"Place imported objects on a diagram"** un noklikšķiniet **Execute**.
5. MySQL Workbench uzreiz automātiski uzģenerēs vizuālu ER diagrammu ar visām 3 tabulām, laukiem, tipiem un saitēm!
6. **Saglabājiet modeļa failu (.mwb)**:
   Izvēlnē: **File → Save Model As...** → saglabājiet kā `acc_database_model.mwb`.
7. **Eksportējiet diagrammu kā PDF vai attēlu**:
   Izvēlnē: **File → Export → Export as PNG...** vai **Export as Single Page PDF...**.
