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
import { wrap, unwrap, containsHiddenMeta } from 'i18next-subliminal'

const wrapped = wrap('my text', { key: 'my.key', ns: 'my-ns', lng: 'en', source: 'translation' })

const unwrapped = unwrap(wrapped)
unwrapped.text // 'my text'
unwrapped.invisibleMeta // { key: 'my.key', ns: 'my-ns', lng: 'en', source: 'translation' }

containsHiddenMeta(wrapped) // true
```

---

<h3 align="center">Gold Sponsors</h3>

<p align="center">
  <a href="https://locize.com/" target="_blank">
    <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
  </a>
</p>

---

**From the creators of i18next: localization as a service - locize.com**

A translation management system built around the i18next ecosystem - [locize.com](https://locize.com).

![locize](https://locize.com/img/ads/github_locize.png)

With using [locize](http://locize.com/?utm_source=react_i18next_readme&utm_medium=github) you directly support the future of i18next.

---
