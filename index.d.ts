import { PostProcessorModule, TOptions } from 'i18next'

export type InvisibleMeta = {
  key: string,
  ns?: string,
  lng?: string,
  source?: 'translation' | 'default' | 'key'
}

export declare function wrap(text: string, invisibleMeta?: InvisibleMeta): string
export type Unwrapped = {
  text: string,
  invisibleMeta?: InvisibleMeta
}

export type UnwrappedSegment = Unwrapped & {
  /** where the wrapped text starts in the text, with its start marker */
  start: number,
  /** where it ends, after its end marker */
  end: number
}

export declare function unwrap(text: string): Unwrapped
export declare function unwrapAll(text: string): UnwrappedSegment[]
export declare function containsHiddenMeta(text: string): boolean
export declare function containsHiddenStartMarker(text: string): boolean

export class PostProcessor implements PostProcessorModule {
  static type: 'postProcessor'
  name: 'subliminal'
  type: 'postProcessor'
  process(
    value: string,
    key: string | string[],
    options: TOptions,
    translator: any
  ): string
}

export type plugin = PostProcessor
