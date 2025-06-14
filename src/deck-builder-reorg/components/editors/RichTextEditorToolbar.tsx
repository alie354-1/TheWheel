import React from 'react';
import { Editor } from '@tiptap/react';
import { ColorPicker } from './ColorPicker.tsx';
import { 
  Bold, Italic, Strikethrough, Code, List, ListOrdered, Link2, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Underline as UnderlineIcon,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon, Highlighter,
  Minus, CornerDownLeft, WrapText, Eraser
} from 'lucide-react';

interface RichTextEditorToolbarProps {
  editor: Editor | null;
}

export const RichTextEditorToolbar: React.FC<RichTextEditorToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex items-center flex-wrap gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-md">
      {/* Text Style */}
      <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Bold"><Bold size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Italic"><Italic size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded ${editor.isActive('underline') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Underline"><UnderlineIcon size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={`p-2 rounded ${editor.isActive('strike') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Strikethrough"><Strikethrough size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffc078' }).run()} className={`p-2 rounded ${editor.isActive('highlight') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Highlight"><Highlighter size={16} /></button>
      
      <div className="border-l border-gray-300 h-6 mx-2"></div>

      {/* Headings */}
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'paragraph') {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level: parseInt(value, 10) as 1 | 2 | 3 | 4 }).run();
          }
        }}
        value={
          editor.isActive('paragraph') ? 'paragraph' :
          editor.isActive('heading', { level: 1 }) ? '1' :
          editor.isActive('heading', { level: 2 }) ? '2' :
          editor.isActive('heading', { level: 3 }) ? '3' :
          editor.isActive('heading', { level: 4 }) ? '4' :
          'paragraph'
        }
        className="p-2 rounded text-xs bg-white border border-gray-300 hover:bg-gray-100"
      >
        <option value="paragraph">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
      </select>

      <div className="border-l border-gray-300 h-6 mx-2"></div>
      
      {/* Font Family */}
      <select
        value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        className="p-2 rounded text-xs bg-white border border-gray-300 hover:bg-gray-100"
      >
        <option value="Inter">Inter</option>
        <option value="serif">Serif</option>
        <option value="monospace">Monospace</option>
        <option value="cursive">Cursive</option>
        <option value="Garamond">Garamond</option>
        <option value="Georgia">Georgia</option>
        <option value="Tahoma">Tahoma</option>
        <option value="Verdana">Verdana</option>
      </select>

      {/* Font Size */}
      <select
        value={editor.getAttributes('textStyle').fontSize || ''}
        onChange={(e) => {
          const size = e.target.value;
          if (size) {
            editor.chain().focus().setFontSize(size).run();
          } else {
            editor.chain().focus().unsetFontSize().run();
          }
        }}
        className="p-2 rounded text-xs bg-white border border-gray-300 hover:bg-gray-100"
      >
        <option value="">Default Size</option>
        <option value="10px">10</option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
        <option value="24px">24</option>
        <option value="28px">28</option>
        <option value="32px">32</option>
        <option value="36px">36</option>
        <option value="48px">48</option>
        <option value="60px">60</option>
        <option value="72px">72</option>
        <option value="96px">96</option>
      </select>

      <div className="border-l border-gray-300 h-6 mx-2"></div>

      {/* Alignment */}
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Align Left"><AlignLeft size={16} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Align Center"><AlignCenter size={16} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Align Right"><AlignRight size={16} /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Align Justify"><AlignJustify size={16} /></button>

      <div className="border-l border-gray-300 h-6 mx-2"></div>

      {/* Lists & Quote */}
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Bullet List"><List size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Ordered List"><ListOrdered size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Blockquote"><Quote size={16} /></button>

      <div className="border-l border-gray-300 h-6 mx-2"></div>

      {/* Link & Scripts */}
      <button onClick={setLink} className={`p-2 rounded ${editor.isActive('link') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Add Link"><Link2 size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`p-2 rounded ${editor.isActive('superscript') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Superscript"><SuperscriptIcon size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={`p-2 rounded ${editor.isActive('subscript') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`} title="Subscript"><SubscriptIcon size={16} /></button>
      
      <div className="border-l border-gray-300 h-6 mx-2"></div>

      {/* Actions */}
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="p-2 rounded hover:bg-gray-200" title="Horizontal Rule"><Minus size={16} /></button>
      <button onClick={() => editor.chain().focus().setHardBreak().run()} className="p-2 rounded hover:bg-gray-200" title="Hard Break"><CornerDownLeft size={16} /></button>
      <button onClick={() => editor.chain().focus().unsetAllMarks().run()} className="p-2 rounded hover:bg-gray-200" title="Clear Formatting"><Eraser size={16} /></button>

      <div className="border-l border-gray-300 h-6 mx-2"></div>
      
      {/* Color */}
      <ColorPicker
  value={editor.getAttributes('textStyle').color}
  onChange={(color) => editor.chain().focus().setColor(color).run()}
  editor={editor}
/>
      
      <div className="border-l border-gray-300 h-6 mx-2"></div>

      {/* Spacing */}
      <select
        value={editor.getAttributes('textStyle').letterSpacing || ''}
        onChange={(e) => editor.chain().focus().setLetterSpacing(e.target.value).run()}
        className="p-2 rounded text-xs bg-white border border-gray-300 hover:bg-gray-100"
      >
        <option value="">Letter Spacing</option>
        <option value="0.1em">Wide</option>
        <option value="0.2em">Wider</option>
      </select>
      <select
        value={editor.getAttributes('paragraph').lineHeight || ''}
        onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
        className="p-2 rounded text-xs bg-white border border-gray-300 hover:bg-gray-100"
      >
        <option value="">Line Height</option>
        <option value="1">Single</option>
        <option value="1.5">1.5</option>
        <option value="2">Double</option>
      </select>
    </div>
  );
};
