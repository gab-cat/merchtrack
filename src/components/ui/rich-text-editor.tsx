import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, Italic, List, ListOrdered, 
  Heading2, Quote, Undo, Redo 
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuButton = ({ 
  isActive, 
  onClick, 
  children 
}: { 
  isActive?: boolean; 
  onClick: () => void; 
  children: React.ReactNode; 
}) => (
  <Button
    variant="ghost"
    size="icon"
    type="button"
    onClick={onClick}
    className={cn(
      'h-8 w-8',
      isActive && 'bg-accent text-accent-foreground'
    )}
  >
    {children}
  </Button>
);

export function RichTextEditor({ value, onChange }: Readonly<RichTextEditorProps>) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="border-input bg-background w-full rounded-md border">
      <div className="border-input flex flex-wrap gap-1 border-b bg-transparent px-3 py-1">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <Bold className="size-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <Italic className="size-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 className="size-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
        >
          <List className="size-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
        >
          <ListOrdered className="size-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
        >
          <Quote className="size-4" />
        </MenuButton>
        <div className="ml-auto flex gap-1">
          <MenuButton onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="size-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="size-4" />
          </MenuButton>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
