import i18next from 'i18next'
import { wrap, unwrap, containsHiddenMeta, PostProcessor } from '../../'
import { expectType } from 'tsd'

expectType<string>(wrap('text', { key: 'some.key' }))
expectType<string>(unwrap('text'))
expectType<boolean>(containsHiddenMeta('text'))

i18next.use(PostProcessor).init()
