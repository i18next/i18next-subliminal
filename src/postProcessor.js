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
      if (options.i18nResolved.res === undefined) {
        if (key !== value) {
          source = 'default'
        } else {
          source = 'key'
        }
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
