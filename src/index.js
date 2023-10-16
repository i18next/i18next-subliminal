import PostProcessor from './postProcessor.js'
import { wrap, unwrap, containsHiddenMeta } from './encoder.js'

export { PostProcessor, PostProcessor as plugin }
export { wrap, unwrap, containsHiddenMeta }

export default { wrap, unwrap, containsHiddenMeta, PostProcessor, plugin: PostProcessor }
