# Správa Obsahu - Astro Content Collections

Webové stránky obce nyní používají **Astro Content Collections** - moderní řešení pro správu obsahu s typováním a validací.

## 🗂️ Struktura Obsahu

Všechen obsah se nachází v `src/content/`:

```
src/content/
├── config.ts              # Definice schémat a typů
├── aktuality/             # Články, zprávy a oznámení
│   ├── kompost.md
│   ├── ples-majova-kytika.md
│   └── ...
├── udalosti/              # Akce a setkání v obci
│   ├── paleni-carodejnic.md
│   ├── petrovskej-den.md
│   └── ...
└── uredni_deska/          # Oficiální dokumenty
    ├── vyhaska-1-2026.md
    ├── zapis-25-4-2026.md
    └── ...
```

## 📝 Jak Přidávat Obsah

### Aktuality (Články)

Vytvořte soubor `src/content/aktuality/nazev-clanku.md`:

```yaml
---
title: Název článku
description: Krátký popis pro seznam
pubDate: 2026-05-01
category: Oznámení  # Volby: Oznámení, Akce, Doprava, Zastupitelstvo, Ostatní
author: Obvykle Obecní úřad
---

Tady napište celý obsah artiklu v Markdownu.

## Nadpisy fungují

- Seznamy
- Také
- Fungují

[Odkazy](https://example.com) taky.
```

### Akce (Eventy)

Vytvořte soubor `src/content/udalosti/nazev-akce.md`:

```yaml
---
title: Název akce
date: 2026-05-08
time: "10:00"              # Volitelné
location: Petrov nad Desnou
eventType: Kultura         # Volby: Kultura, Sport, Setkání, Administrativa
description: Krátký popis
isFeatured: true           # Zobrazit na homepage
---

Podrobný popis akce v Markdownu...
```

### Úřední Deska (Dokumenty)

Vytvořte soubor `src/content/uredni_deska/dokument.md`:

```yaml
---
title: Název dokumentu/vyhlášky
pubDate: 2026-05-01
category: Vyhláška         # Volby: Vyhláška, Úřední oznámení, Zápis ze zasedání, Výběrové řízení
fileUrl: /dokumenty/file.pdf  # Volitelné: odkaz na soubor
isArchived: false          # true = skrýt ze seznamu
---

Obsah dokumentu (metadata)...
```

## 🚀 Automat Generování Stránek

Webové stránky se **automaticky generují** z vašeho obsahu:

- **Aktuality** → Seznam na `/aktuality` + jednotlivé stránky `/aktuality/nazev-clanku`
- **Akce** → Zobrazují se na `/zivot#akce`
- **Úřední deska** → Celý seznam na `/uredni-deska`
- **Homepage** → Zobrazuje poslední 3 články, 3 akce a 3 dokumenty

## ✨ Výhody Content Collections

✅ **Typování** - Zod schéma zajišťuje správnost dat
✅ **Staticky generované** - Bez databáze, čistý kód
✅ **SEO optimalizace** - Všechny stránky indexovatelné
✅ **Snadná editace** - Prosté markdown soubory
✅ **Verzování** - Obsah v Gitu

## 🔍 Validation (Ověřování)

Pokud vyplníte špatné údaje, Astro build selže s chybou:

```
✖ src/content/aktuality/muj-clanek.md (collection: aktuality)
  category should be one of [Oznámení, Akce, Doprava, Zastupitelstvo, Ostatní]
```

To je **dobré** - zabezpečuje kvalitu dat.

## 📋 Příklad: Přidání Nové Aktuality

1. Vytvořte soubor: `src/content/aktuality/prvomajove-slavnosti-2026.md`
2. Napište:

```yaml
---
title: Prvomájové slavnosti 2026
description: Zveme vás na tradiční prvomájové oslavy s hudbou a soutěžemi
pubDate: 2026-05-01
category: Akce
author: Kulturní komise
---

## Zveme Vás!

Přijďte oslovat příchod jara na **prvomájových slavnostech 2026**.

- 🎵 Hudba na živo
- 🏆 Soutěže pro děti
- 🍔 Občerstvení
- 🎪 Zábava pro celou rodinu

**Kdy:** 1. května 2026  
**Kde:** Náměstí Petrov nad Desnou  
**Čas:** Od 14:00
```

3. Uložte a stránka se automaticky vygeneruje!

## 🛠️ Aktualizace Obsahu

- Změníte-li obsah v `src/content/`, dev server jej automaticky refreshne
- Build proces ověří všechny data před deploym

## 📚 Další Informace

Více o Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
