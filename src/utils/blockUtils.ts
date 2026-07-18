import { BlockType, EmailBlock } from '../types';
import { blockRegistry } from '../blocks/registry';

export const createDefaultBlock = (type: BlockType): EmailBlock => {
    const uniqueId = `${type}-${Date.now()}`;
    const def = blockRegistry.get(type);
    
    let block: EmailBlock = {
      id: uniqueId,
      type,
      style: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
      }
    };

    if (def) {
      if (def.defaultContent) block.content = def.defaultContent;
      if (def.defaultProps) block.properties = { ...def.defaultProps };
      if (def.defaultStyle) block.style = { ...block.style, ...def.defaultStyle };
    }

    return block;
};
