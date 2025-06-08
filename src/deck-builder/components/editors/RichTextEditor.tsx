import React from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { LetterSpacing } from '../../extensions/letter-spacing.ts';
import { FontSize } from '../../extensions/font-size.ts';
import { LineHeight } from '../../extensions/line-height.ts';
import { RichTextEditorToolbar } from './RichTextEditorToolbar.tsx';
import { 
  Bold, Italic, Strikethrough,
  Heading1, Heading2, List
} from 'lucide-react';

import { ThemeSettings } from '../ThemeCustomizationPanel.tsx';

interface RichTextEditorProps {
  content: string;
  placeholder?: string;
  onChange: (newContent: string) => void;
  onBlur?: () => void;
  themeSettings?: Partial<ThemeSettings>;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, onBlur, placeholder, themeSettings }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Superscript,
      Subscript,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontFamily,
      LetterSpacing,
      LineHeight,
      FontSize,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      if (onBlur) {
        onBlur();
      }
    },
    editorProps: {
      attributes: {
        class: 'max-w-none focus:outline-none',
        style: `font-size: ${themeSettings?.fontSize || '16px'}`,
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className="relative text-black">
      {editor && <RichTextEditorToolbar editor={editor} />}
      <EditorContent editor={editor} className="p-4 bg-white rounded-b-md min-h-[200px] focus:outline-none max-w-none"/>
    </div>
  );
};
