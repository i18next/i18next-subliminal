import { PostProcessorModule, TOptions } from 'i18next'

export type InvisibleMeta = {
  key: string,
  ns?: string,
  lng?: string,
  source?: 'translation' | 'default' | 'key'
}

export declare function wrap(text: string, invisibleMeta?: InvisibleMeta): string
export declare function unwrap(text: string): string
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
