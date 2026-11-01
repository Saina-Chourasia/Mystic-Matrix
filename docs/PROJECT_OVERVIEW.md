# 🔮 MYSTIC MATRIX: The Enchanted Inventory & Demand Forecasting System
## Comprehensive Project Overview

> **Tagline:** *"Where Magical Inventory Meets Intelligent Predictions."*  
> **Secondary Tagline:** *"The Enchanted Inventory for Every Potion and Prophecy."*  
> **Prepared for:** Halloween Hackathon 2026 • Madam Hex's Potion & Ingredient Emporium  
> **Unified Single-Host Public URL:** `http://localhost:5001`

---

## 1. The Story & The Problem

In the heart of the Hallowmere Nocturnal Market lies Madam Hex's enchanted apothecary. For decades, Madam Hex has crafted elixirs and supplied raw reagents to witches, wizards, warlocks, necromancers, and alchemists. 

However, her business suffered from chronic retail inventory volatility:
1. **Critical Reagent Stockouts:** High-velocity ingredients like *Fairy Wings*, *Bat Wings*, and *Ghost Pepper* frequently sold out completely right before major midnight sabbats.
2. **Capital Trapped in Overstock:** Over-purchasing slow-moving items like *Stardust* and *Fame Potions* left thousands of Gold Galleons trapped on dusty shelves.
3. **The Halloween Demand Shock:** Every October, customer demand spikes by up to **300%–500%**. Without predictive modeling, Madam Hex was caught completely unprepared.
4. **Opaque Parchment Tracking:** Manual paper ledgers failed to track real-time stock velocity, lead times from enchanted realm suppliers, or safety buffers.

**MYSTIC MATRIX** solves this by uniting a **breathtaking fantasy landscape and 16-bit wizarding atmosphere** with an **enterprise-grade retail demand forecasting and inventory intelligence engine**.

---

## 2. Visual Architecture & Design System

The visual identity recreates the enchanting, landscape-style composition of the reference fantasy world:

### A. The Hero Landscape
- **Left Side:** Madam Hex's cozy timber-and-stone potion shop with a purple shingled roof, warm glowing lattice windows, wooden potion counter with colorful elixirs, hanging violet potion sign, and wooden barrels of crystals and herbs.
- **Center:** Open sky clearing framing the large, elegant **HEXVENTORY** title, secondary tagline, two prominent CTA buttons (*"Enter the Pantry →"* and *"Explore Features"*), and four horizontal feature shortcuts (*Inventory, Forecast, Detect, Restock*).
- **Right Side:** Distant mountain silhouettes crowned by a fairy-tale magical castle with glowing turrets and a cascading waterfall plunging into a turquoise mist pool.
- **Top Framing:** Overhanging mossy tree branches with hanging lanterns framing the viewport naturally.
- **Foreground:** Cobblestone pathway, meadow flowers, and floating fireflies/embers.

### B. Day Mode vs Night Mode
- **Day Mode (Sunlit Magical World):** Soft sky-blue skies, gentle clouds, warm sunlight, golden-green trees, lavender flowers, bright purple shop roof, and turquoise waterfalls.
- **Night Mode (Moonlit Enchanted World):** Deep cosmic indigo-violet sky, large glowing moon, twinkling stars, warm glowing shop windows, glowing purple potion phials, and hovering fireflies.
- **Theme Persistence:** Toggled via the Sun/Moon button in the integrated navbar and saved in `localStorage`.

---

## 3. Core Pillars & Architecture

```
HEXVENTORY/
├── frontend/             # React 18 + Vite + Tailwind CSS + Recharts + Lucide Icons
│   ├── src/components/   # MagicalLandscapeScene, PixelIcon (22 items), Navbar, Modals
│   ├── src/pages/        # Welcome (Landscape Landing), Dashboard, Inventory, Forecasting, Recommendations, Analytics
│   ├── src/services/     # API Client with relative /api endpoints
│   └── src/utils/        # Autonomous Web Audio API Sound Synthesizer
├── backend/              # Node.js + Express REST API
│   ├── config/           # Database configuration
│   ├── controllers/      # Product, Sales, Forecast, Recommendation, Analytics controllers
│   ├── models/           # Relational SQL models (Products, Sales, Transactions, Forecasts, Suppliers)
│   ├── services/         # Holt-Winters Forecasting Service, Recommendation Service, Analytics Service
│   └── server.js         # Single-host Express server serving both React UI & REST API on port 5001
├── database/             # Relational Database Layer
│   ├── schemas/          # schema.sql (6 core relational tables)
│   ├── seed/             # 22 canonical items + 90 days realistic sales history
│   └── hexventory.db     # SQLite database powered by native node:sqlite
└── docs/                 # Documentation & Mathematical Specifications
```

---

## 4. The 22 Canonical Shop Products

Madam Hex's apothecary catalog consists of 22 canonical items split into two major categories:

### A. Magical Ingredients (12 Reagents)
1. **Bat Wings**: Essential for flying draughts and eerie rituals. Halloween surge $2.0\times$.
2. **Ghost Pepper**: Ethereal peppers from haunted specter gardens. Accelerating velocity, Halloween surge $2.5\times$.
3. **Stardust**: Cosmic cometary residue. **Overstocked** (145 units vs 24 monthly demand).
4. **Fairy Wings**: Delicate gossamer wings. **Critical stockout risk** ($< 1$ day remaining). Halloween surge $2.8\times$.
5. **Dragon Scales**: Fire-resistant armored scales. Healthy, optimal inventory balance.
6. **Phoenix Feathers**: Rare plumage with restorative properties. Moderate volume, high margin.
7. **Unicorn Hair**: Silken mane strands for binding spells. Consistent velocity.
8. **Mandrake Roots**: Screaming subterranean herbal roots. Seasonal surge $1.7\times$.
9. **Moon Dust**: Silver particulates collected during total eclipses. Steady demand.
10. **Vampire Blood**: Synthetic crimson essence. Low stock, surge $2.2\times$.
11. **Witch Hazel**: Astringent soothing bark. Evergreen steady mover.
12. **Crystal Shards**: Focusing prisms. Healthy stock.

### B. Magical Potions (10 Brewed Elixirs)
1. **Love Potion**: Roseate infatuation draught. **Top seller**, surges $3.2\times$ for Halloween charms.
2. **Invisibility Potion**: Stealth mist elixir. High margin, steady demand.
3. **Flying Potion**: Sky-blue buoyant draught for broom journeys. Surges $2.2\times$.
4. **Beauty Potion**: Radiant glamour serum. Consistent popularity.
5. **Disguise Potion**: Shapeshifting brew for Halloween costumes. Surges $2.7\times$.
6. **Fame Potion**: Effervescent golden vanity liquor. Slow mover.
7. **Luck Potion**: Liquid probability charm. High-value treasure elixir.
8. **Memory Potion**: Cobalt cerebral tincture for spell memorization.
9. **Healing Potion**: Emerald revitalizing draught. **Highest overall volume**.
10. **Truth Serum**: Compels uncompromising honesty. Surges $1.8\times$.

---

## 5. Feature Tour

1. **Magical Landscape Hero Landing (`/`)**:
   - Wide, immersive Day and Night landscape scene featuring Madam Hex's shop, distant mountain castle, waterfall, stone path, overhanging tree canopy, and integrated frosted navigation.
2. **Features Section (`#features`)**:
   - 4 spacious feature cards: *Magical Inventory*, *Demand Forecasting*, *Stockout Detection*, and *Smart Restocking*.
3. **About Madam Hex (`#about`)**:
   - Lore describing Madam Hex's struggles with inventory volatility and the Halloween demand shock.
4. **How It Works (3 Steps)**:
   - *Track Sales &rarr; Forecast Demand &rarr; Optimize Inventory*.
5. **Canonical Product Showcase**:
   - 6 items (*Fairy Wings, Stardust, Ghost Pepper, Love Potion, Flying Potion, Invisibility Potion*) with vector pixel-art artwork and live inventory status.
6. **Executive Command Sanctum (Dashboard)**:
   - 4 clean KPI cards (*Inventory Value, Critical Stockouts, 30d Projected Demand, Inventory Health Score*), Halloween Surge simulator, and 30-day historical revenue chart.
7. **Apothecary Inventory Registry**:
   - Grid and Table view toggles, instant search, category filters, and quick stock adjustments with audit logging.
8. **AI Demand Forecasting Hub**:
   - Holt-Winters exponential smoothing projections (7-day and 30-day), actual vs. projected chart with 95% confidence bounds, and complete reorder ledger table.
9. **Smart Procurement Recommendations**:
   - Prioritized AI advice cards with one-click restock application that updates SQLite live with celebratory confetti and audio chimes.
10. **Sales & Revenue Analytics**:
   - Daily revenue velocity curves, customer demographic cohort breakdown, product profit margin audit, and interactive live counter sale recorder.
