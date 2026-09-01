"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type Props = {
  name?: string;
  initialHtml?: string;
  onChangeHtml?: (html: string) => void;
  onRequestImage?: () => void;
  /** Imperative insert from parent when media picker returns */
  insertImageRef?: React.MutableRefObject<
    ((url: string, alt?: string) => void) | null
  >;
};

export function ArticleBodyEditor({
  name = "body",
  initialHtml = "",
  onChangeHtml,
  onRequestImage,
  insertImageRef,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "article-inline-image" },
      }),
      Placeholder.configure({
        placeholder: "Write the story…",
      }),
    ],
    content: initialHtml || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChangeHtml?.(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || !initialHtml) return;
    if (editor.getHTML() === initialHtml) return;
    editor.commands.setContent(initialHtml, { emitUpdate: false });
  }, [editor, initialHtml]);

  useEffect(() => {
    if (!insertImageRef) return;
    insertImageRef.current = (url: string, alt = "") => {
      editor
        ?.chain()
        .focus()
        .setImage({ src: url, alt })
        .run();
    };
    return () => {
      insertImageRef.current = null;
    };
  }, [editor, insertImageRef]);

  const html = editor?.getHTML() ?? initialHtml;

  return (
    <div className="tiptap-shell">
      <div className="tiptap-toolbar" role="toolbar" aria-label="Formatting">
        <ToolbarBtn
          label="Bold"
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarBtn
          label="Italic"
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarBtn
          label="H2"
          active={editor?.isActive("heading", { level: 2 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarBtn
          label="List"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarBtn
          label="Numbered"
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarBtn
          label="Link"
          active={editor?.isActive("link")}
          onClick={() => {
            const prev = editor?.getAttributes("link").href as string | undefined;
            const url = window.prompt("Link URL", prev ?? "https://");
            if (url === null) return;
            if (url === "") {
              editor?.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor
              ?.chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
        />
        <ToolbarBtn
          label="Image"
          onClick={() => onRequestImage?.()}
        />
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}

function ToolbarBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "is-active" : undefined}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
