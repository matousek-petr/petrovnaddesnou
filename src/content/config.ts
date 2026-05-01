import { defineCollection, z } from 'astro:content';

// Kolekce aktuality (články, oznámení)
const aktualityCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['Oznámení', 'Akce', 'Doprava', 'Zastupitelstvo', 'Ostatní']),
    author: z.string().optional(),
    ogImage: z.string().optional(),
  }),
});

// Kolekce události (akce v obci)
const udalostiCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    time: z.string().optional(), // HH:MM
    location: z.string(),
    description: z.string(),
    eventType: z.enum(['Kultura', 'Sport', 'Setkání', 'Administrativa']).optional(),
    isFeatured: z.boolean().default(false),
  }),
});

// Kolekce úřední deska (dokumenty, vyhlášky)
const uredniDeskaCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['Vyhláška', 'Úřední oznámení', 'Zápis ze zasedání', 'Výběrové řízení']),
    fileUrl: z.string().optional(), // URL na PDF
    isArchived: z.boolean().default(false),
  }),
});

// Kolekce stránky (informační stránky)
const strankyCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
  }),
});

export const collections = {
  aktuality: aktualityCollection,
  udalosti: udalostiCollection,
  uredni_deska: uredniDeskaCollection,
  stranky: strankyCollection,
};
