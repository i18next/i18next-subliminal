// wrap() puts a start marker before a text and an end marker after it. The end marker carries the
// meta (key, namespace, language, source) as JSON: its UTF-8 bytes, four base-4 digits per byte.
// Markers describe themselves, so a text wrapped on a server (server rendering) decodes in the browser.
//
// U+2060 (word joiner) frames a marker and U+2061–U+2064 are its digits: the start marker is a frame
// around one digit, an end marker a frame around a multiple of four, so neither can be mistaken for
// the other, nor for a U+2060 of the text itself (the HTML entity &NoBreak;). All are
// default-ignorable format characters, the same on the server and in the browser: they draw nothing
// and allow no line break. Measured in Chromium: the start marker (3 characters) leaves Arabic letters
// joined, a run of 8 or more breaks the joining, so a translation that ends inside an Arabic word
// breaks it at its end marker; any marker splits an Indic cluster it falls into. The zero-width
// (non-)joiners used before 2.0 broke Arabic joining at both ends, and their server set (with U+200B,
// a line break opportunity) could not be read in the browser.
const FRAME = '\u2060'
const DIGITS = ['\u2061', '\u2062', '\u2063', '\u2064']
const START_MARKER = FRAME + DIGITS[0] + FRAME
const MARKER_SOURCE = '\u2060([\u2061-\u2064]+)\u2060'
const END_MARKER_AT_END = /\u2060(?:[\u2061-\u2064]{4})+\u2060$/
const MARKERS = new RegExp(MARKER_SOURCE, 'g')

// one letter per source keeps markers short
const SOURCE_CODES = { translation: 't', default: 'd', key: 'k' }
const SOURCE_NAMES = { t: 'translation', d: 'default', k: 'key' }
const has = (map, name) => Object.prototype.hasOwnProperty.call(map, name)
const stringOrUndefined = (value) => (typeof value === 'string' && value) || undefined

const encodeMeta = ({ key, ns, lng, source } = {}) => {
  const bytes = new TextEncoder().encode(JSON.stringify([key, ns, lng, has(SOURCE_CODES, source) ? SOURCE_CODES[source] : source]))
  let digits = ''
  for (const byte of bytes) {
    digits += DIGITS[byte >> 6] + DIGITS[(byte >> 4) & 3] + DIGITS[(byte >> 2) & 3] + DIGITS[byte & 3]
  }
  return FRAME + digits + FRAME
}

const decodeMeta = (digits) => {
  if (digits.length % 4) return
  const bytes = new Uint8Array(digits.length / 4)
  for (let i = 0; i < digits.length; i++) {
    bytes[i >> 2] = bytes[i >> 2] * 4 + digits.charCodeAt(i) - 0x2061
  }
  let parsed
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes))
  } catch (e) {
    return
  }
  if (!Array.isArray(parsed)) return
  const [key, ns, lng, source] = parsed
  return {
    key: stringOrUndefined(key),
    ns: stringOrUndefined(ns),
    lng: stringOrUndefined(lng),
    source: has(SOURCE_NAMES, source) ? SOURCE_NAMES[source] : stringOrUndefined(source)
  }
}

// Markers written before 2.0 in a browser: every byte as 8 bits and a separator bit, U+200C for 0
// and U+200D for 1. Still read, so a text wrapped by an older copy of this package (an app that
// wraps with its own i18next-subliminal) keeps working with a newer reader; no longer written.
// The set older versions used on a server (U+200B/U+200C) is not read: a browser never could.
const LEGACY_CHARACTERS = ['\u200C', '\u200D']
const LEGACY_RUNS = /(?:[\u200C\u200D]{9})+/g
const LEGACY_START_MARKER = Array.from(new TextEncoder().encode('subliminal:start'))
  .map((byte) => byte.toString(2).padStart(8, '0') + '0')
  .join('')
  .replace(/[01]/g, (bit) => LEGACY_CHARACTERS[bit])

const decodeLegacy = (run) => {
  const bytes = []
  for (let i = 0; i + 9 <= run.length; i += 9) {
    bytes.push(parseInt(Array.from(run.slice(i, i + 8), (c) => LEGACY_CHARACTERS.indexOf(c)).join(''), 2))
  }
  return new TextDecoder().decode(new Uint8Array(bytes))
}

const legacyMeta = (text) => {
  const runs = text.match(LEGACY_RUNS)
  if (!runs) return
  try {
    const parsed = JSON.parse(decodeLegacy(runs[runs.length - 1]))
    return { key: parsed.k, ns: parsed.n, lng: parsed.l, source: parsed.s }
  } catch (e) {
    return undefined
  }
}

const containsLegacyMeta = (text) =>
  text.length >= 27 && /[\u200C\u200D]{9}$/.test(text) && decodeLegacy(text.slice(-9)) === '}'

const removeInvisibles = (text) => text.replace(MARKERS, '').replace(LEGACY_RUNS, '')

export function wrap (text, invisibleMeta = {}) {
  // invisibleMeta: { key, ns, lng, source: 'translation' | 'default' | 'key' }
  return typeof text === 'string' && text ? START_MARKER + text + encodeMeta(invisibleMeta) : text
}

// Every wrapped text in `text`, in the order its end marker appears (an inner text, nested in an
// outer one, comes first). `start` and `end` span the text with both its markers, so a caller can
// replace one text: `text.slice(0, start) + wrap(newValue, invisibleMeta) + text.slice(end)`.
export function unwrapAll (text) {
  if (typeof text !== 'string') return []
  const segments = []
  const starts = []
  let from = 0
  const markers = new RegExp(MARKER_SOURCE, 'g')
  let match
  while ((match = markers.exec(text))) {
    if (match[1].length === 1) {
      starts.push(match.index)
      continue
    }
    const invisibleMeta = decodeMeta(match[1])
    if (!invisibleMeta) continue // not one of ours: leave it in the text, and the start markers alone
    // Without its start marker (cut off into another text node) the text starts after the previous
    // one: a wrapped text before it in this node is taken for a sibling, not for one nested in it.
    const start = starts.length ? starts.pop() : from
    const end = match.index + match[0].length
    segments.push({ text: removeInvisibles(text.slice(start, match.index)), invisibleMeta, start, end })
    from = end
  }
  if (!segments.length) {
    const invisibleMeta = legacyMeta(text)
    if (invisibleMeta) segments.push({ text: removeInvisibles(text), invisibleMeta, start: 0, end: text.length })
  }
  return segments
}

// the text without markers, and the meta of its last wrapped text
export function unwrap (text) {
  if (typeof text !== 'string') return { text, invisibleMeta: undefined }
  const segments = unwrapAll(text)
  const last = segments[segments.length - 1]
  return { text: removeInvisibles(text), invisibleMeta: last && last.invisibleMeta }
}

// whether `text` ends with an end marker
export function containsHiddenMeta (text) {
  if (!text || typeof text !== 'string') return false
  return END_MARKER_AT_END.test(text) || containsLegacyMeta(text)
}

// whether `text` starts with a start marker
export function containsHiddenStartMarker (text) {
  if (!text || typeof text !== 'string') return false
  return text.startsWith(START_MARKER) || text.startsWith(LEGACY_START_MARKER)
}
