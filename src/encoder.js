const isBrowser = typeof window !== 'undefined'
// we need 2 invisible chars to represent 0 and 1 in our binary
const INVISIBLE_CHARACTERS = isBrowser ? ['\u200C', '\u200D'] : ['\u200B', '\u200C'] // U+200D is somehow shown as some sort of space on command line output
const INVISIBLE_REGEX = RegExp(
  `([${INVISIBLE_CHARACTERS.join('')}]{9})+`,
  'gu'
)
const TEMPLATE_MINIMUM_LENGTH = '{"k":"a"}'.length

const prependStartMarker = true // setting this to true will potentially add a space before the text, when rendering (for example in the server side console)
const invisibleStartMarker = 'subliminal:start'

const toBytes = (text) => Array.from(new TextEncoder().encode(text))
const fromBytes = (bytes) => new TextDecoder().decode(new Uint8Array(bytes))

const padToWholeBytes = (binary) => {
  const needsToAdd = 8 - binary.length
  return '0'.repeat(needsToAdd) + binary
}

const encodeMessage = (text) => {
  const bytes = toBytes(text).map(Number)
  const binary = bytes
    .map((byte) => padToWholeBytes(byte.toString(2)) + '0')
    .join('')
  const result = Array.from(binary)
    .map((b) => INVISIBLE_CHARACTERS[Number(b)])
    .join('')
  return result
}

const encodedInvisibleStartMarker = prependStartMarker ? encodeMessage(invisibleStartMarker) : ''

const decodeMessage = (message) => {
  const binary = Array.from(message)
    .map((character) => {
      return INVISIBLE_CHARACTERS.indexOf(character)
    })
    .map(String)
    .join('')
  const textBytes = binary.match(/(.{9})/g)
  const codes = Uint8Array.from(
    textBytes?.map((byte) => parseInt(byte.slice(0, 8), 2)) || []
  )
  return fromBytes(codes)
}

const decodeFromText = (text) => {
  const invisibleMessages = text.match(INVISIBLE_REGEX)?.filter((m) => m.length > (TEMPLATE_MINIMUM_LENGTH - 1))
  if (!invisibleMessages || invisibleMessages.length === 0) return
  return decodeMessage(invisibleMessages[invisibleMessages.length - 1])
}

const removeInvisibles = (text) => text.replace(INVISIBLE_REGEX, '')

const encodeValue = (data) => {
  if (Object.keys(data).length === 0) return data
  const value = {
    k: data.key,
    n: data.ns,
    l: data.lng,
    s: data.source
  }
  return JSON.stringify(value)
}

const decodeValue = (value) => {
  if (!value || typeof value !== 'string' || value.indexOf('{') !== 0) return
  try {
    const parsed = JSON.parse(value || '{}')
    return {
      key: parsed.k,
      ns: parsed.n,
      lng: parsed.l,
      source: parsed.s
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    // console.error(e)
    return undefined
  }
}

export function wrap (text, invisibleMeta = {}) {
  // invisibleMeta:
  // {
  //   key,
  //   ns,
  //   lng,
  //   source // default | key | translation
  // }
  const encodedValue = encodeValue(invisibleMeta)
  const invisibleMark = encodeMessage(encodedValue)
  return typeof text === 'string' && text ? (encodedInvisibleStartMarker + text + invisibleMark) : text
}

export function unwrap (text) {
  const encodedValue = decodeFromText(text)
  const decodedVal = decodeValue(encodedValue)
  const result = removeInvisibles(text)
  return { text: result, invisibleMeta: decodedVal }
}

export function containsHiddenMeta (text) {
  if (!text || text.length < 27) return false
  if (!INVISIBLE_REGEX.test(text)) return false
  const lastByte = text.substring(text.length - 9)
  const lastChar = decodeMessage(lastByte)
  return lastChar === '}'
}

export function containsHiddenStartMarker (text) {
  return text.startsWith(encodedInvisibleStartMarker)
}
