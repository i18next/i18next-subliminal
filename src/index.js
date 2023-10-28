import PostProcessor from './postProcessor.js'
import { wrap, unwrap, containsHiddenMeta, containsHiddenStartMarker } from './encoder.js'

export { PostProcessor, PostProcessor as plugin }
export { wrap, unwrap, containsHiddenMeta, containsHiddenStartMarker }

export default { wrap, unwrap, containsHiddenMeta, containsHiddenStartMarker, PostProcessor, plugin: PostProcessor }
