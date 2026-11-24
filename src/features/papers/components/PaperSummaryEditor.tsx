import { useEffect } from "react";
import { Box, Button, FormHelperText } from "@mui/material";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Underline from "@tiptap/extension-underline";

interface PaperSummaryEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
}

interface ToolbarButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <Button
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      size="small"
      sx={{
        minWidth: 36,
        px: 0.75,
        color: "text.primary",
        bgcolor: active ? "#F3E1E6" : "transparent",
        fontSize: "1rem",
      }}
    >
      {children}
    </Button>
  );
}

export default function PaperSummaryEditor({
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}: PaperSummaryEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
      }),
      Underline,
      Subscript,
      Superscript,
    ],
    content: value || "<p></p>",
    editable: !disabled,
    editorProps: {
      attributes: {
        "aria-label": "Resumen del trabajo",
      },
    },
    onUpdate: ({ editor: updatedEditor }) => onChange(updatedEditor.getHTML()),
  });
  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive("bold") ?? false,
      italic: currentEditor?.isActive("italic") ?? false,
      underline: currentEditor?.isActive("underline") ?? false,
      superscript: currentEditor?.isActive("superscript") ?? false,
      subscript: currentEditor?.isActive("subscript") ?? false,
      blockquote: currentEditor?.isActive("blockquote") ?? false,
    }),
  });

  useEffect(() => {
    if (!editor) return;

    const editorContent = editor.getHTML();
    const expectedContent = value || "<p></p>";
    if (editorContent !== expectedContent) {
      editor.commands.setContent(expectedContent, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  return (
    <Box>
      <Box
        sx={{
          border: 1,
          borderColor: error ? "error.main" : "divider",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "#F3EFEE",
          "& .tiptap": {
            minHeight: 180,
            px: 2,
            py: 1.5,
            outline: "none",
            bgcolor: "common.white",
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
          },
          "& .tiptap p": {
            m: 0,
          },
          "& .tiptap p + p": {
            mt: 1,
          },
          "& .tiptap em, & .tiptap i": {
            fontStyle: "italic",
          },
          "& .tiptap blockquote": {
            borderLeft: 3,
            borderColor: "primary.main",
            color: "text.secondary",
            m: 0,
            pl: 1.5,
          },
        }}
      >
        <Box
          role="toolbar"
          aria-label="Formato del resumen"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.25,
            px: 1,
            py: 0.75,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "#F3EFEE",
          }}
        >
          <ToolbarButton
            label="Negrita"
            active={editorState?.bold ?? false}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Box component="span" sx={{ fontWeight: 700 }}>
              B
            </Box>
          </ToolbarButton>
          <ToolbarButton
            label="Cursiva"
            active={editorState?.italic ?? false}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Box component="span" sx={{ fontStyle: "italic" }}>
              I
            </Box>
          </ToolbarButton>
          <ToolbarButton
            label="Subrayado"
            active={editorState?.underline ?? false}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Box component="span" sx={{ textDecoration: "underline" }}>
              U
            </Box>
          </ToolbarButton>
          <ToolbarButton
            label="Superíndice"
            active={editorState?.superscript ?? false}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
          >
            X²
          </ToolbarButton>
          <ToolbarButton
            label="Subíndice"
            active={editorState?.subscript ?? false}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
          >
            X₂
          </ToolbarButton>
          <ToolbarButton
            label="Cita"
            active={editorState?.blockquote ?? false}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            “ ”
          </ToolbarButton>
        </Box>
        <EditorContent editor={editor} onBlur={onBlur} />
      </Box>
      <FormHelperText
        error={!!error}
        sx={{ mx: 0.25, mt: 0.75, color: error ? undefined : "primary.main" }}
      >
        {error ||
          "Admite negrita, cursiva, subrayado, subíndices, superíndices y citas."}
      </FormHelperText>
    </Box>
  );
}
