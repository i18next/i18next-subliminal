import should from 'should'
import i18next from 'i18next'
import { PostProcessor, wrap } from '../index.js'

describe('postProcessor', () => {
  before(() => {
    i18next
      .use(PostProcessor)
      .init({
        postProcess: 'subliminal',
        postProcessPassResolved: true,
        lng: 'en',
        resources: {
          en: {
            translation: {
              key: 'Hello world!',
              key2: 'Lorem ipsum dolor sit amet'
            }
          }
        }
      })
  })

  describe('basic', () => {
    const tests = [
      { args: ['key'], expected: wrap('Hello world!', { key: 'key', ns: 'translation', lng: 'en', source: 'translation' }) },
      { args: ['key2'], expected: wrap('Lorem ipsum dolor sit amet', { key: 'key2', ns: 'translation', lng: 'en', source: 'translation' }) },
      { args: ['no translation in resources'], expected: wrap('no translation in resources', { key: 'no translation in resources', ns: 'translation', lng: 'dev', source: 'key' }) },
      { args: ['keyd', 'default VALUE'], expected: wrap('default VALUE', { key: 'keyd', ns: 'translation', lng: 'dev', source: 'default' }) }
    ]

    tests.forEach((test) => {
      it('correctly translates for ' + JSON.stringify(test.args) + ' args', () => {
        should(i18next.t.apply(i18next, test.args)).eql(test.expected)
      })
    })
  })
})
