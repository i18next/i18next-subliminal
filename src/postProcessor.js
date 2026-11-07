import { wrap } from './encoder.js'

const postProcessorName = 'subliminal'
const SubliminalPostProcessor = {
  name: postProcessorName,
  type: 'postProcessor',
  options: {},

  setOptions (options) {
    this.options = { ...options, ...this.options }
  },

  process (value, keyIn, options, translator) {
    const opt = this.options = { ...options, ...this.options }

    let key, ns, lng, source
    if (options.i18nResolved) {
      key = options.i18nResolved.exactUsedKey
      ns = options.i18nResolved.usedNS
      lng = options.i18nResolved.usedLng
      // params = options.i18nResolved.usedParams
      const res = options.i18nResolved.res
      // i18next falls back to the default value or the key when nothing is found, and since v27 also for an
      // empty string (returnEmptyString: false) and an object without returnObjects
      const fellBack = res === undefined || res === null || (res === '' && value !== '') ||
        (typeof res === 'object' && !Array.isArray(res))
      if (fellBack) {
        source = key !== value ? 'default' : 'key'
      } else {
        source = 'translation'
      }
    } else {
      const keySeparator = opt.keySeparator ?? translator?.options?.keySeparator ?? '.'
      const { key: extractedKey, namespaces } = translator.extractFromKey(
        keyIn.join(keySeparator),
        options
      )
      key = extractedKey
      ns = namespaces?.[0] ?? opt.ns ?? translator?.options?.defaultNS
      lng = options.lng || this.language
      if (key === value) {
        source = 'key'
      } else {
        source = 'translation'
      }
    }

    return wrap(value, {
      key,
      ns,
      lng,
      source
    })
  },

  overloadTranslationOptionHandler () {
    return {
      postProcess: postProcessorName,
      postProcessPassResolved: true
    }
  }
}

export default SubliminalPostProcessor
