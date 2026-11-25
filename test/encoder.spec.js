import should from 'should'
import { wrap, unwrap, unwrapAll, containsHiddenMeta, containsHiddenStartMarker } from '../index.js'

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

// what versions before 2.0 wrote in a browser
const legacyWrap = (text, { key, ns, lng, source }) => {
  const encode = (str) => Array.from(new TextEncoder().encode(str))
    .map((byte) => byte.toString(2).padStart(8, '0') + '0')
    .join('')
    .replace(/[01]/g, (bit) => ['\u200C', '\u200D'][bit])
  return encode('subliminal:start') + text + encode(JSON.stringify({ k: key, n: ns, l: lng, s: source }))
}

describe('marker format', () => {
  const meta = { key: 'welcome', ns: 'translation', lng: 'en', source: 'translation' }

  it('uses only U+2060–U+2064, the same on server and in the browser', () => {
    const invisibles = wrap('Welcome', meta).replace('Welcome', '')
    should(/^[\u2060-\u2064]+$/.test(invisibles)).eql(true)
  })

  it('is short', () => {
    // 684 invisible characters before 2.0
    should(wrap('Welcome', meta).length - 'Welcome'.length).be.below(150)
  })

  it('keeps any key, namespace and language', () => {
    const odd = { key: 'ключ.😀 "quoted" \\ back', ns: 'ns:with:colons', lng: 'zh-Hant-TW', source: 'default' }
    should(unwrap(wrap('x', odd)).invisibleMeta).eql(odd)
  })

  it('handles no and bad input', () => {
    should(containsHiddenMeta(null)).eql(false)
    should(containsHiddenStartMarker(undefined)).eql(false)
    should(unwrapAll(null)).eql([])
    should(wrap('', meta)).eql('')
    // a start marker alone, and digits that are no JSON, are no meta
    should(unwrap('a\u2060\u2061\u2060').invisibleMeta).eql(undefined)
    should(unwrap('a\u2060\u2061\u2061\u2061\u2061\u2060').invisibleMeta).eql(undefined)
    should(unwrap(null)).eql({ text: null, invisibleMeta: undefined })
  })

  it('keeps U+2060 of the text itself apart from the markers', () => {
    const meta = { key: 'k', ns: 'n' }
    for (const text of ['ends with\u2060', '\u2060starts', 'A\u2060\u2060B', '100\u2060%']) {
      const wrapped = wrap(text, meta)
      should(containsHiddenMeta(wrapped)).eql(true)
      should(unwrapAll(wrapped)).eql([{ text, invisibleMeta: { key: 'k', ns: 'n', lng: undefined, source: undefined }, start: 0, end: wrapped.length }])
    }
  })

  it('skips an end marker it cannot read, without using up a start marker', () => {
    const wrapped = wrap('f\u2060\u2061\u2061\u2061\u2061\u2060x', { key: 'k' })
    const segments = unwrapAll(wrapped)
    should(segments.length).eql(1)
    should(segments[0].start).eql(0)
  })

  it('reads only plain strings from a marker', () => {
    const digits = (json) => Array.from(new TextEncoder().encode(json))
      .map((b) => [b >> 6, (b >> 4) & 3, (b >> 2) & 3, b & 3].map((d) => String.fromCharCode(0x2061 + d)).join('')).join('')
    const crafted = 'x\u2060' + digits('["k",{"a":1},null,"__proto__"]') + '\u2060'
    should(unwrap(crafted).invisibleMeta).eql({ key: 'k', ns: undefined, lng: undefined, source: '__proto__' })
    should(unwrap('x\u2060' + digits('["k",null,null,"toString"]') + '\u2060').invisibleMeta.source).eql('toString')
  })
})

describe('unwrapAll', () => {
  it('finds every wrapped text, and where it is', () => {
    const a = wrap('Hello', { key: 'a', ns: 'n', lng: 'en', source: 'translation' })
    const b = wrap('World', { key: 'b', ns: 'n', lng: 'en', source: 'key' })
    const text = `→ ${a} / ${b}!`
    const segments = unwrapAll(text)
    should(segments.map((s) => [s.text, s.invisibleMeta.key])).eql([['Hello', 'a'], ['World', 'b']])
    should(text.slice(segments[0].start, segments[0].end)).eql(a)
    should(text.slice(segments[1].start, segments[1].end)).eql(b)

    // replacing one leaves the other and the text around them alone
    const s = segments[0]
    const replaced = text.slice(0, s.start) + wrap('Hi', s.invisibleMeta) + text.slice(s.end)
    should(unwrap(replaced).text).eql('→ Hi / World!')
    should(unwrapAll(replaced).map((x) => x.invisibleMeta.key)).eql(['a', 'b'])
  })

  it('handles a text nested in another one', () => {
    const inner = wrap('inner', { key: 'inner', ns: 'n' })
    const outer = wrap(`before ${inner} after`, { key: 'outer', ns: 'n' })
    const segments = unwrapAll(outer)
    should(segments.map((s) => s.invisibleMeta.key)).eql(['inner', 'outer'])
    should(segments[1].text).eql('before inner after')
    should(segments[1].start).eql(0)
    should(segments[1].end).eql(outer.length)
  })

  it('starts a text without its start marker after the previous one', () => {
    const a = wrap('a', { key: 'a' })
    const cut = wrap('b', { key: 'b' }).slice(3) // the start marker is in another text node
    const segments = unwrapAll(a + ' b-prefix ' + cut)
    should(segments[1].text).eql(' b-prefix b')
    should(segments[1].start).eql(a.length)
  })
})

describe('markers written before 2.0', () => {
  const meta = { key: 'myk', ns: 'myn', lng: 'myl', source: 'translation' }
  const old = legacyWrap('hello world', meta)

  it('are still read', () => {
    should(containsHiddenMeta(old)).eql(true)
    should(containsHiddenStartMarker(old)).eql(true)
    should(unwrap(old)).eql({ text: 'hello world', invisibleMeta: meta })
    should(unwrapAll(old)).eql([{ text: 'hello world', invisibleMeta: meta, start: 0, end: old.length }])
  })
})
