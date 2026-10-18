import fs from 'node:fs'

const jobs = [
  {
    file: 'src/i18n/de.ts',
    importPath: './service-pages-de',
    exportName: 'servicePagesDe',
    ui: {
      back: 'Alle Services',
      highlights: 'Leistungen im Überblick',
      related: 'Weitere Services',
      cta: 'Projekt starten',
      overview: 'Übersicht',
    },
  },
  {
    file: 'src/i18n/en.ts',
    importPath: './service-pages-en',
    exportName: 'servicePagesEn',
    ui: {
      back: 'All services',
      highlights: 'What you get',
      related: 'More services',
      cta: 'Start project',
      overview: 'Overview',
    },
  },
  {
    file: 'src/i18n/ar.ts',
    importPath: './service-pages-ar',
    exportName: 'servicePagesAr',
    ui: {
      back: 'كل الخدمات',
      highlights: 'ما نقدّمه',
      related: 'خدمات أخرى',
      cta: 'ابدأ المشروع',
      overview: 'نظرة عامة',
    },
  },
]

for (const job of jobs) {
  let s = fs.readFileSync(job.file, 'utf8')
  if (!s.includes(job.importPath)) {
    s = s.replace(
      "import type { Messages } from './types'\n",
      `import type { Messages } from './types'\nimport { ${job.exportName} } from '${job.importPath}'\n`
    )
  }
  const start = s.indexOf('  serviceUi:')
  const footer = s.indexOf('  footer:')
  if (start < 0 || footer < 0) throw new Error(`markers missing in ${job.file}`)
  const { back, highlights, related, cta, overview } = job.ui
  const block = `  serviceUi: {
    back: ${JSON.stringify(back)},
    highlights: ${JSON.stringify(highlights)},
    related: ${JSON.stringify(related)},
    cta: ${JSON.stringify(cta)},
    overview: ${JSON.stringify(overview)},
  },
  servicePages: ${job.exportName},
`
  s = s.slice(0, start) + block + s.slice(footer)
  fs.writeFileSync(job.file, s)
  console.log('updated', job.file)
}
