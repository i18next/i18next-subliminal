import should from 'should'
import { wrap, unwrap, containsHiddenMeta, containsHiddenStartMarker } from '../index.js'

describe('encoder', () => {
  describe('roundtrip', () => {
    it('should work as expected', async () => {
      const originalText = 'hello world'
      const wrapped = wrap(originalText, { key: 'myk', ns: 'myn', lng: 'myl', source: 'translation' })
      const unwrapped = unwrap(wrapped)

      should(unwrapped).have.a.property('text', 'hello world')
      should(unwrapped).have.a.property('invisibleMeta')
      should(unwrapped.invisibleMeta).have.a.property('key', 'myk')
      should(unwrapped.invisibleMeta).have.a.property('ns', 'myn')
      should(unwrapped.invisibleMeta).have.a.property('lng', 'myl')
      should(unwrapped.invisibleMeta).have.a.property('source', 'translation')
    })
  })

  describe('containsHiddenMeta and containsHiddenStartMarker', () => {
    it('should work as expected', async () => {
      const originalText = 'hello world'
      const wrapped = wrap(originalText, { key: 'myk', ns: 'myn', lng: 'myl', source: 'translation' })
      should(containsHiddenMeta(wrapped)).eql(true)
      should(containsHiddenMeta('normal text')).eql(false)

      should(containsHiddenStartMarker(wrapped)).eql(true)
      should(containsHiddenStartMarker('normal text')).eql(false)
    })
  })

  describe('unwrap an normal text', () => {
    it('should work as expected', async () => {
      const originalText = 'hello world'
      const unwrapped = unwrap(originalText)
      should(unwrapped).have.a.property('text', 'hello world')
      should(unwrapped).have.a.property('invisibleMeta', undefined)
    })
  })
})
