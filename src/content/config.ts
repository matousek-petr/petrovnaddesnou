import { defineCollection, z } from 'astro:content';

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

const udalostiCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    time: z.string().optional(),
    location: z.string(),
    description: z.string(),
    eventType: z.enum(['Kultura', 'Sport', 'Setkání', 'Administrativa']).optional(),
    posterImage: z.string().optional(),
    isFeatured: z.boolean().default(false),
  }),
});

const uredniDeskaCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(),
    reference: z.string().optional(),
    fileUrl: z.string().optional(),
    sourceUrl: z.string().optional(),
    isArchived: z.boolean().default(false),
  }),
});

const strankyCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
  }),
});

const obcasnikCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    number: z.number(),
    pubDate: z.coerce.date(),
    fileUrl: z.string(),
  }),
});

// Lékaři – jeden YAML soubor na lékaře
const lekarCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    phone: z.string(),
    address: z.string(),
    updated: z.string(),
    hours: z.array(z.object({
      day: z.string(),
      slots: z.array(z.string()),
    })),
  }),
});

// Zaměstnanci – jediný soubor seznam.yaml se seznamem
const zamestnancCollection = defineCollection({
  type: 'data',
  schema: z.object({
    contacts: z.array(z.object({
      role: z.string(),
      name: z.string(),
      phone: z.string(),
      phone2: z.string().optional(),
      email: z.string(),
    })),
  }),
});

// Zastupitelé – jediný soubor seznam.yaml se seznamem
const zastupiteleCollection = defineCollection({
  type: 'data',
  schema: z.object({
    volebnObdobi: z.string(),
    members: z.array(z.object({
      name: z.string(),
      role: z.string(),
    })),
  }),
});

// Spolky – jediný soubor seznam.yaml se seznamem
const spolkyCollection = defineCollection({
  type: 'data',
  schema: z.object({
    items: z.array(z.object({
      name: z.string(),
      desc: z.string(),
      href: z.string().optional(),
    })),
  }),
});

// Nastavení – různé singleton soubory (uredni-hodiny, odpad…)
const nastaveniCollection = defineCollection({
  type: 'data',
  schema: z.union([
    // uredni-hodiny.yaml
    z.object({
      note: z.string().optional(),
      hours: z.array(z.object({
        day: z.string(),
        am: z.string(),
        pm: z.string(),
      })),
    }),
    // odpad.yaml
    z.object({
      items: z.array(z.object({
        type: z.string(),
        schedule: z.string(),
      })),
    }),
  ]),
});

export const collections = {
  aktuality: aktualityCollection,
  udalosti: udalostiCollection,
  uredni_deska: uredniDeskaCollection,
  stranky: strankyCollection,
  obcasnik: obcasnikCollection,
  lekari: lekarCollection,
  zamestnanci: zamestnancCollection,
  zastupitele: zastupiteleCollection,
  spolky: spolkyCollection,
  nastaveni: nastaveniCollection,
};
