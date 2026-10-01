import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import UnderlineExtension from "@tiptap/extension-underline";
import { useState, useRef, useEffect } from "react";
import { uploadImageToR2ServerFn } from "@/lib/server/galeri";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  Code,
  Loader2,
} from "lucide-react";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export function TipTapEditor({ content, onChange }: Props) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(content);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const editorImageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4, 5],
        },
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-amber-700 underline font-medium",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-2xl max-w-full my-4 shadow-sm border border-black/10",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setRawHtml(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "blog-content tiptap max-w-none focus:outline-none min-h-[350px] p-4 text-ink leading-relaxed",
      },
    },
  });

  // Sync if external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML() && !isHtmlMode) {
      editor.commands.setContent(content, { emitUpdate: false });
      setRawHtml(content);
    }
  }, [content, editor, isHtmlMode]);

  function handleHtmlChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setRawHtml(val);
    onChange(val);
    if (editor) {
      editor.commands.setContent(val, { emitUpdate: false });
    }
  }

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Bağlantı adresi (URL):", previousUrl || "https://");

    if (url === null) return;
    if (url === "" || url === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  // Direct PC Image Upload into Editor -> R2
  async function handleEditorImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setIsUploadingImage(true);
    try {
      // 1. Convert to WebP in browser
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(bitmap, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/webp", 0.92);
      });

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          resolve(res.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      const fileName = `${cleanName}-${Date.now()}.webp`;

      // 2. Upload to Cloudflare R2
      const res = await uploadImageToR2ServerFn({
        data: {
          fileName,
          base64Data,
          contentType: "image/webp",
          addToGallery: false,
        },
      });

      if (res.success && res.url) {
        editor.chain().focus().setImage({ src: res.url, alt: cleanName }).run();
      }
    } catch (err) {
      console.error("Görsel yüklenirken hata:", err);
      alert("Görsel yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsUploadingImage(false);
      if (editorImageInputRef.current) {
        editorImageInputRef.current.value = "";
      }
    }
  }

  if (!editor) return null;

  return (
    <div className="rounded-[20px] border border-black/15 bg-white overflow-hidden shadow-xs">
      {/* Hidden image input for inserting into article */}
      <input
        type="file"
        ref={editorImageInputRef}
        onChange={handleEditorImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#f8f7f4] border-b border-black/10 select-none">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold flex items-center gap-1 transition ${
            editor.isActive("heading", { level: 2 })
              ? "bg-black text-white"
              : "text-black/70 hover:bg-black/5"
          }`}
          title="Başlık 2 (H2)"
        >
          <Heading2 className="size-4" />
          <span>H2</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold flex items-center gap-1 transition ${
            editor.isActive("heading", { level: 3 })
              ? "bg-black text-white"
              : "text-black/70 hover:bg-black/5"
          }`}
          title="Başlık 3 (H3)"
        >
          <Heading3 className="size-4" />
          <span>H3</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold flex items-center gap-1 transition ${
            editor.isActive("heading", { level: 4 })
              ? "bg-black text-white"
              : "text-black/70 hover:bg-black/5"
          }`}
          title="Başlık 4 (H4)"
        >
          <Heading4 className="size-4" />
          <span>H4</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold flex items-center gap-1 transition ${
            editor.isActive("heading", { level: 5 })
              ? "bg-black text-white"
              : "text-black/70 hover:bg-black/5"
          }`}
          title="Başlık 5 (H5)"
        >
          <Heading5 className="size-4" />
          <span>H5</span>
        </button>

        <div className="h-5 w-px bg-black/15 mx-1" />

        {/* Basic Styles */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg text-[13px] transition ${
            editor.isActive("bold") ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
          }`}
          title="Kalın (Bold)"
        >
          <Bold className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg text-[13px] transition ${
            editor.isActive("italic") ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
          }`}
          title="İtalik"
        >
          <Italic className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg text-[13px] transition ${
            editor.isActive("underline") ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
          }`}
          title="Altı Çizili"
        >
          <UnderlineIcon className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg text-[13px] transition ${
            editor.isActive("strike") ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
          }`}
          title="Üstü Çizili"
        >
          <Strikethrough className="size-4" />
        </button>

        <div className="h-5 w-px bg-black/15 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg text-[13px] transition ${
            editor.isActive("bulletList") ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
          }`}
          title="Madde İşaretli Liste"
        >
          <List className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg text-[13px] transition ${
            editor.isActive("orderedList") ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
          }`}
          title="Numaralı Liste"
        >
          <ListOrdered className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg text-[13px] transition ${
            editor.isActive("blockquote") ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
          }`}
          title="Alıntı Kutusu"
        >
          <Quote className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded-lg text-black/70 hover:bg-black/5 transition"
          title="Yatay Çizgi"
        >
          <Minus className="size-4" />
        </button>

        <div className="h-5 w-px bg-black/15 mx-1" />

        {/* Links & Images */}
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded-lg transition ${
            editor.isActive("link") ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
          }`}
          title="Bağlantı (Link) Ekle"
        >
          <LinkIcon className="size-4" />
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
            title="Bağlantıyı Kaldır"
          >
            <Unlink className="size-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => editorImageInputRef.current?.click()}
          disabled={isUploadingImage}
          className="p-2 rounded-lg text-black/70 hover:bg-black/5 transition inline-flex items-center gap-1.5"
          title="İçeriğe Görsel Yükle (R2'ye aktarır)"
        >
          {isUploadingImage ? (
            <Loader2 className="size-4 animate-spin text-amber-600" />
          ) : (
            <ImageIcon className="size-4" />
          )}
        </button>

        <div className="h-5 w-px bg-black/15 mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg text-black/70 hover:bg-black/5 transition disabled:opacity-30"
          title="Geri Al"
        >
          <Undo className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg text-black/70 hover:bg-black/5 transition disabled:opacity-30"
          title="İleri Al"
        >
          <Redo className="size-4" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* HTML Toggle Button */}
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-mono font-semibold inline-flex items-center gap-1.5 transition ${
              isHtmlMode ? "bg-black text-white" : "bg-black/5 text-black/70 hover:bg-black/10"
            }`}
            title="HTML Kaynak Kodu Görüntüle / Düzenle"
          >
            <Code className="size-3.5" />
            <span>{isHtmlMode ? "Görsel Editöre Dön" : "HTML Kodu"}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isHtmlMode ? (
        <textarea
          value={rawHtml}
          onChange={handleHtmlChange}
          rows={16}
          className="w-full p-4 font-mono text-[13px] leading-relaxed text-ink bg-[#faf9f5] focus:outline-none"
          placeholder="<p>HTML içeriği...</p>"
        />
      ) : (
        <div className="p-3 min-h-[350px] bg-white blog-content">
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}
