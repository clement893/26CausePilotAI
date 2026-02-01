/**
 * Email editor block types - Étape 3.1.2
 * Structure JSON pour l'éditeur drag & drop (EmailTemplate.content)
 */

export type BlockType = 'text' | 'image' | 'button' | 'separator' | 'columns';

export interface TextBlockProps {
  content: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ImageBlockProps {
  src: string;
  alt?: string;
  width?: number;
  link?: string;
}

export interface ButtonBlockProps {
  label: string;
  href: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
}

export interface SeparatorBlockProps {
  color?: string;
  thickness?: number;
}

export interface ColumnsBlockProps {
  columns: number; // 2 or 3
  blocks: EmailBlock[][]; // blocks per column
}

export type BlockProps =
  | (TextBlockProps & { type?: 'text' })
  | (ImageBlockProps & { type?: 'image' })
  | (ButtonBlockProps & { type?: 'button' })
  | (SeparatorBlockProps & { type?: 'separator' })
  | (ColumnsBlockProps & { type?: 'columns' });

export interface EmailBlock {
  id: string;
  type: BlockType;
  props: TextBlockProps | ImageBlockProps | ButtonBlockProps | SeparatorBlockProps | ColumnsBlockProps;
}

export interface EmailEditorContent {
  blocks: EmailBlock[];
}

export const DEFAULT_BLOCK_PROPS: Record<BlockType, Partial<BlockProps>> = {
  text: { content: 'Votre texte ici', fontSize: 16, fontFamily: 'Arial', color: '#333333', align: 'left' },
  image: { src: '', alt: '', width: 600 },
  button: { label: 'Cliquez ici', href: '#', backgroundColor: '#3B82F6', color: '#ffffff', fontSize: 16 },
  separator: { color: '#e5e7eb', thickness: 1 },
  columns: { columns: 2, blocks: [[], []] },
};

export function createBlock(type: BlockType, id?: string): EmailBlock {
  const blockId = id ?? `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const d = DEFAULT_BLOCK_PROPS;
  if (type === 'text') return { id: blockId, type: 'text', props: { content: 'Votre texte ici', fontSize: 16, fontFamily: 'Arial', color: '#333333', align: 'left', ...d.text } };
  if (type === 'image') return { id: blockId, type: 'image', props: { src: '', alt: '', width: 600, ...d.image } };
  if (type === 'button') return { id: blockId, type: 'button', props: { label: 'Cliquez ici', href: '#', backgroundColor: '#3B82F6', color: '#ffffff', fontSize: 16, ...d.button } };
  if (type === 'separator') return { id: blockId, type: 'separator', props: { color: '#e5e7eb', thickness: 1, ...d.separator } };
  return { id: blockId, type: 'columns', props: { columns: 2, blocks: [[], []] } };
}
