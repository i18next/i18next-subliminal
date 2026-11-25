import i18next from 'i18next'
import { wrap, unwrap, unwrapAll, containsHiddenMeta, PostProcessor, Unwrapped, UnwrappedSegment } from '../../'
import { expectType } from 'tsd'

expectType<string>(wrap('text', { key: 'some.key' }))
expectType<Unwrapped>(unwrap('text'))
expectType<UnwrappedSegment[]>(unwrapAll('text'))
expectType<boolean>(containsHiddenMeta('text'))

i18next.use(PostProcessor).init()
