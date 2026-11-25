import PostProcessor from './postProcessor.js'
import { wrap, unwrap, unwrapAll, containsHiddenMeta, containsHiddenStartMarker } from './encoder.js'

export { PostProcessor, PostProcessor as plugin }
export { wrap, unwrap, unwrapAll, containsHiddenMeta, containsHiddenStartMarker }

export default { wrap, unwrap, unwrapAll, containsHiddenMeta, containsHiddenStartMarker, PostProcessor, plugin: PostProcessor }
