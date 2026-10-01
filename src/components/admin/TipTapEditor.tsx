import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import UnderlineExtension from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
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
  Table as TableIcon,
  Plus,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

// Custom Image Extension with data-size and data-align attributes
const CustomImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-size": {
        default: "medium",
        renderHTML: (attributes) => ({
          "data-size": attributes["data-size"] || "medium",
        }),
        parseHTML: (element) => element.getAttribute("data-size") || "medium",
      },
      "data-align": {
        default: "center",
        renderHTML: (attributes) => ({
          "data-align": attributes["data-align"] || "center",
        }),
        parseHTML: (element) => element.getAttribute("data-align") || "center",
      },
    };
  },
});

export function TipTapEditor({ content, onChange }: Props) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(content);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const editorImageInputRef = useRef<HTMLInputElement>(null);

  // Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(false);

  // Image Upload Settings Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [imageSize, setImageSize] = useState<"small" | "medium" | "full">("medium");
  const [imageAlign, setImageAlign] = useState<"left" | "center" | "right">("center");
  const [imageAlt, setImageAlt] = useState("");

  // Table Submenu Dropdown State
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);

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
      CustomImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-2xl shadow-sm border border-black/10",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
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

  // --- MODERN LINK MODAL HANDLER ---
  function openLinkModal() {
    if (!editor) return;
    const existingHref = editor.getAttributes("link").href || "";
    const target = editor.getAttributes("link").target;
    setLinkUrl(existingHref);
    setLinkOpenInNewTab(target === "_blank");
    setIsLinkModalOpen(true);
  }

  function handleSaveLink() {
    if (!editor) return;

    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: linkUrl.trim(),
          target: linkOpenInNewTab ? "_blank" : undefined,
        })
        .run();
    }
    setIsLinkModalOpen(false);
  }

  function handleRemoveLink() {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsLinkModalOpen(false);
  }

  // --- DIRECT PC IMAGE UPLOAD WITH SIZING/ALIGNMENT MODAL ---
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
        setPendingImageUrl(res.url);
        setImageAlt(file.name.replace(/\.[^/.]+$/, ""));
        setImageSize("medium"); // Default to medium size instead of giant full
        setImageAlign("center");
        setIsImageModalOpen(true);
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

  function handleInsertImageWithSettings() {
    if (!editor || !pendingImageUrl) return;

    editor
      .chain()
      .focus()
      .setImage({
        src: pendingImageUrl,
        alt: imageAlt.trim() || "Parlak Mobilya Blog Görseli",
        "data-size": imageSize,
        "data-align": imageAlign,
      } as any)
      .run();

    setIsImageModalOpen(false);
    setPendingImageUrl("");
  }

  // --- TABLE INSERTION & MANAGEMENT ---
  function insertTable() {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
    setIsTableMenuOpen(false);
  }

  if (!editor) return null;

  const isTableActive = editor.isActive("table");

  return (
    <div className="rounded-[20px] border border-black/15 bg-white overflow-hidden shadow-xs relative">
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
          title="İtalik (Italic)"
        >
          <Italic className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg text-[13px] transition ${
            editor.isActive("underline") ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
          }`}
          title="Altı Çizili (Underline)"
        >
          <UnderlineIcon className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg text-[13px] transition ${
            editor.isActive("strike") ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
          }`}
          title="Üstü Çizili (Strikethrough)"
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
          title="Madde İmli Liste"
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
          title="Alıntı Kutusu (Blockquote)"
        >
          <Quote className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded-lg text-black/70 hover:bg-black/5 transition"
          title="Yatay Çizgi (Ayrıcı)"
        >
          <Minus className="size-4" />
        </button>

        <div className="h-5 w-px bg-black/15 mx-1" />

        {/* Modern Link Button (No browser window.prompt!) */}
        <button
          type="button"
          onClick={openLinkModal}
          className={`p-2 rounded-lg text-[13px] transition ${
            editor.isActive("link") ? "bg-amber-800 text-white" : "text-black/70 hover:bg-black/5"
          }`}
          title="Bağlantı (Link) Ekle / Düzenle"
        >
          <LinkIcon className="size-4" />
        </button>

        {/* Direct PC Image Upload Button */}
        <button
          type="button"
          onClick={() => editorImageInputRef.current?.click()}
          disabled={isUploadingImage}
          className="p-2 rounded-lg text-black/70 hover:bg-black/5 transition flex items-center gap-1.5 disabled:opacity-40"
          title="Bilgisayardan Görsel Ekle (WebP / R2)"
        >
          {isUploadingImage ? (
            <Loader2 className="size-4 animate-spin text-amber-700" />
          ) : (
            <ImageIcon className="size-4" />
          )}
          <span className="text-[12px] font-medium hidden sm:inline">Görsel</span>
        </button>

        <div className="h-5 w-px bg-black/15 mx-1" />

        {/* Professional Table Button & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTableMenuOpen(!isTableMenuOpen)}
            className={`p-2 rounded-lg text-[13px] flex items-center gap-1 transition ${
              isTableActive ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
            }`}
            title="Tablo İşlemleri"
          >
            <TableIcon className="size-4" />
            <span className="text-[12px] font-medium hidden sm:inline">Tablo</span>
          </button>

          {isTableMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-52 rounded-[16px] bg-white border border-black/10 shadow-xl p-2 z-30 text-[12.5px] space-y-1">
              {!isTableActive ? (
                <button
                  type="button"
                  onClick={insertTable}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#faf9f5] flex items-center gap-2 font-medium text-ink transition cursor-pointer"
                >
                  <Plus className="size-3.5 text-black/60" />
                  <span>3x3 Tablo Ekle</span>
                </button>
              ) : (
                <>
                  <div className="px-2 py-1 text-[11px] font-semibold text-black/40 uppercase">
                    Tablo Düzenleme
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowBefore().run();
                      setIsTableMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#faf9f5] transition cursor-pointer"
                  >
                    Üste Satır Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowAfter().run();
                      setIsTableMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#faf9f5] transition cursor-pointer"
                  >
                    Alta Satır Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteRow().run();
                      setIsTableMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-600 transition cursor-pointer"
                  >
                    Satırı Sil
                  </button>
                  <div className="h-px bg-black/5 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnBefore().run();
                      setIsTableMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#faf9f5] transition cursor-pointer"
                  >
                    Sola Sütun Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnAfter().run();
                      setIsTableMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#faf9f5] transition cursor-pointer"
                  >
                    Sağa Sütun Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteColumn().run();
                      setIsTableMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-600 transition cursor-pointer"
                  >
                    Sütunu Sil
                  </button>
                  <div className="h-px bg-black/5 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteTable().run();
                      setIsTableMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Tabloyu Tamamen Sil</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

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

        {/* Right side HTML View Toggle */}
        <div className="ml-auto flex items-center gap-2">
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

      {/* ========================================================
          1. MODERN LINK MODAL (Replaces window.prompt)
         ======================================================== */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="relative w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <div className="flex items-center gap-2">
                <LinkIcon className="size-4 text-black/70" />
                <h4 className="text-[16px] font-display font-semibold text-ink">
                  Bağlantı (Link) Ekle / Düzenle
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded-full text-black/40 hover:text-black hover:bg-black/5 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-1.5">
                  Hedef Web Adresi veya Sayfa URL'si *
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://www.ornek.com veya /iletisim"
                  autoFocus
                  className="w-full rounded-[14px] border border-black/15 px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:border-black font-medium"
                />
              </div>

              {/* Quick Preset Links */}
              <div>
                <span className="block text-[11.5px] font-medium text-black/50 mb-1.5">
                  Hızlı Sayfa Bağlantıları:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["/iletisim", "/projeler", "/hizmetler", "/blog"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLinkUrl(preset)}
                      className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-[11.5px] font-mono text-zinc-800 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Open in new tab checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-[13px] text-ink/80 pt-1">
                <input
                  type="checkbox"
                  checked={linkOpenInNewTab}
                  onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                  className="size-4 rounded accent-black"
                />
                <span>Yeni sekmede açılsın (target="_blank")</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/8 gap-2">
              {editor.isActive("link") ? (
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="px-3.5 py-2 rounded-full text-red-600 hover:bg-red-50 text-[12.5px] font-semibold transition cursor-pointer"
                >
                  Bağlantıyı Kaldır
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-black/15 text-[13px] font-medium text-ink hover:bg-black/5 transition cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleSaveLink}
                  className="px-5 py-2 rounded-full bg-black text-white text-[13px] font-semibold hover:bg-zinc-800 transition shadow-xs cursor-pointer"
                >
                  Bağlantıyı Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. IMAGE SIZING & ALIGNMENT MODAL (Control Size & Align)
         ======================================================== */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="relative w-full max-w-lg rounded-[26px] bg-white p-6 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-black/70" />
                <h4 className="text-[16px] font-display font-semibold text-ink">
                  Görsel Boyutu ve Hizalama Ayarı
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 rounded-full text-black/40 hover:text-black hover:bg-black/5 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="py-4 space-y-5">
              {/* Image Preview */}
              <div className="relative h-44 rounded-[18px] overflow-hidden bg-black/5 border border-black/10 flex items-center justify-center p-2">
                <img
                  src={pendingImageUrl}
                  alt="Önizleme"
                  className="max-h-full max-w-full object-contain rounded-[12px]"
                />
              </div>

              {/* 1. Size Options */}
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-2">
                  Görsel Boyutu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setImageSize("small")}
                    className={`py-2 px-3 rounded-[14px] text-[12.5px] font-medium border text-center transition cursor-pointer ${
                      imageSize === "small"
                        ? "bg-black text-white border-black font-semibold shadow-xs"
                        : "bg-white text-ink border-black/15 hover:bg-[#faf9f5]"
                    }`}
                  >
                    Küçük (%38)
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageSize("medium")}
                    className={`py-2 px-3 rounded-[14px] text-[12.5px] font-medium border text-center transition cursor-pointer ${
                      imageSize === "medium"
                        ? "bg-black text-white border-black font-semibold shadow-xs"
                        : "bg-white text-ink border-black/15 hover:bg-[#faf9f5]"
                    }`}
                  >
                    Orta (%68) <span className="text-[10px] opacity-80 block font-normal">Önerilen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageSize("full")}
                    className={`py-2 px-3 rounded-[14px] text-[12.5px] font-medium border text-center transition cursor-pointer ${
                      imageSize === "full"
                        ? "bg-black text-white border-black font-semibold shadow-xs"
                        : "bg-white text-ink border-black/15 hover:bg-[#faf9f5]"
                    }`}
                  >
                    Tam Genişlik (%100)
                  </button>
                </div>
              </div>

              {/* 2. Alignment Options */}
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-2">
                  Hizalama
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setImageAlign("left")}
                    className={`py-2 px-3 rounded-[14px] text-[12.5px] font-medium border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      imageAlign === "left"
                        ? "bg-black text-white border-black font-semibold shadow-xs"
                        : "bg-white text-ink border-black/15 hover:bg-[#faf9f5]"
                    }`}
                  >
                    <AlignLeft className="size-3.5" />
                    <span>Sola Yasla</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageAlign("center")}
                    className={`py-2 px-3 rounded-[14px] text-[12.5px] font-medium border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      imageAlign === "center"
                        ? "bg-black text-white border-black font-semibold shadow-xs"
                        : "bg-white text-ink border-black/15 hover:bg-[#faf9f5]"
                    }`}
                  >
                    <AlignCenter className="size-3.5" />
                    <span>Ortala</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageAlign("right")}
                    className={`py-2 px-3 rounded-[14px] text-[12.5px] font-medium border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      imageAlign === "right"
                        ? "bg-black text-white border-black font-semibold shadow-xs"
                        : "bg-white text-ink border-black/15 hover:bg-[#faf9f5]"
                    }`}
                  >
                    <AlignRight className="size-3.5" />
                    <span>Sağa Yasla</span>
                  </button>
                </div>
              </div>

              {/* 3. Alt Text (SEO) */}
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-1.5">
                  Görsel Alt Açıklaması (SEO İçin)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Görselin ne olduğunu kısaca belirtin..."
                  className="w-full rounded-[14px] border border-black/15 px-3.5 py-2 text-[13.5px] text-ink focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/8">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 rounded-full border border-black/15 text-[13px] font-medium text-ink hover:bg-black/5 transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleInsertImageWithSettings}
                className="px-6 py-2.5 rounded-full bg-black text-white text-[13px] font-semibold hover:bg-zinc-800 transition shadow-sm cursor-pointer"
              >
                Makaleye Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
