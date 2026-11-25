# Introduction

[![Actions](https://github.com/i18next/i18next-subliminal/workflows/node/badge.svg)](https://github.com/i18next/i18next-subliminal/actions?query=workflow%3Anode)
[![npm version](https://img.shields.io/npm/v/i18next-subliminal.svg?style=flat-square)](https://www.npmjs.com/package/i18next-subliminal)

This package helps to pass meta information via invisible characters for the shown translation resources.

# Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/i18next-subliminal).

```bash
# npm package
$ npm install i18next-subliminal
```

## Wiring up as i18next plugin:

```js
import i18next from 'i18next'
import { PostProcessor } from 'i18next-subliminal'

i18next.use(PostProcessor).init({
  postProcess: 'subliminal',
  postProcessPassResolved: true,
})
```

## standalone usage:

```js
import { wrap, unwrap, unwrapAll, containsHiddenMeta } from 'i18next-subliminal'

const wrapped = wrap('my text', { key: 'my.key', ns: 'my-ns', lng: 'en', source: 'translation' })

const unwrapped = unwrap(wrapped)
unwrapped.text // 'my text'
unwrapped.invisibleMeta // { key: 'my.key', ns: 'my-ns', lng: 'en', source: 'translation' }

containsHiddenMeta(wrapped) // true

// several wrapped texts in one string (two translations in one text node)
const both = `${wrap('Hello', { key: 'a' })} ${wrap('World', { key: 'b' })}`
unwrapAll(both) // [{ text: 'Hello', invisibleMeta: { key: 'a' }, start, end }, { text: 'World', ... }]
// `start` and `end` span a wrapped text with its markers, to replace just that one
```

## the markers

A wrapped text gets a start marker before it and an end marker after it, made of U+2060 (word joiner) and U+2061–U+2064. They draw nothing and allow no line break; text around a whole translation renders as without them. Inside a word they are not neutral: a translation that ends inside an Arabic word breaks the joining at its end marker (markers before 2.0 broke it at both ends), any marker splits an Indic letter cluster it falls into, and a `::first-letter` style (a drop cap) applies to the start marker instead of the first letter, as before 2.0. The end marker carries the meta itself, so a text wrapped on the server (server rendering) is read in the browser.

Since 2.0 markers are about a fifth as long as before. Markers written by older versions in a browser (U+200C/U+200D) are still read, not written. A reader older than 2.0 does not see 2.0 markers at all: upgrade whatever reads them (the [locize](https://github.com/locize/locize) InContext editor from 4.8.0) together with this package.

---

<h3 align="center">Gold Sponsors</h3>

<p align="center">
  <a href="https://www.locize.com/?utm_source=i18next_subliminal_readme&utm_medium=github&utm_campaign=readme" target="_blank">
    <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
  </a>
</p>

---

**From the creators of i18next: localization as a service - locize.com**

A translation management system built around the i18next ecosystem - [locize.com](https://www.locize.com?utm_source=i18next_subliminal_readme&utm_medium=github&utm_campaign=readme).

With using [locize](https://www.locize.com/?utm_source=i18next_subliminal_readme&utm_medium=github&utm_campaign=readme) you directly support the future of i18next.

---
