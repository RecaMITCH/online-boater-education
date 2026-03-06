import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Eye,
  ImagePlus,
  ChevronDown,
  ChevronUp,
  Loader2,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";
import RichTextEditor from "@/components/rich-text-editor";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function BlogEditor() {
  const [, setLocation] = useLocation();
  const [matchNew] = useRoute("/admin/blog/new");
  const [matchEdit, params] = useRoute("/admin/blog/:id");
  const isNew = !!matchNew;
  const articleId = params?.id ? parseInt(params.id) : null;

  const queryClient = useQueryClient();
  const [showSeo, setShowSeo] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    coverImageUrl: "",
    isPublished: false,
  });

  // Fetch existing article for edit mode
  const { data: article, isLoading } = useQuery({
    queryKey: ["/api/admin/articles", articleId],
    queryFn: async () => {
      if (!articleId) return null;
      const res = await fetch(`/api/admin/articles`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch articles");
      const articles = await res.json();
      return articles.find((a: any) => a.id === articleId) || null;
    },
    enabled: !!articleId,
  });

  // Populate form when article loads
  useEffect(() => {
    if (article) {
      setForm({
        title: article.title || "",
        slug: article.slug || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        metaTitle: article.metaTitle || "",
        metaDescription: article.metaDescription || "",
        coverImageUrl: article.coverImageUrl || "",
        isPublished: article.isPublished || false,
      });
      setSlugManuallyEdited(true); // Don't auto-generate slug for existing articles
    }
  }, [article]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, slugManuallyEdited]);

  const handleChange = useCallback((field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Upload image helper - converts file to base64 and sends as JSON
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const toBase64 = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    const base64 = await toBase64(file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: base64, filename: file.name, mimeType: file.type }),
    });
    if (!res.ok) throw new Error("Upload failed");
    const result = await res.json();
    return result.url;
  }, []);

  // Cover image upload
  const handleCoverUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, coverImageUrl: url }));
    } catch (err) {
      alert("Failed to upload cover image");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }, [uploadImage]);

  // Cover image drag and drop
  const handleCoverDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setCoverUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, coverImageUrl: url }));
    } catch (err) {
      alert("Failed to upload cover image");
    } finally {
      setCoverUploading(false);
    }
  }, [uploadImage]);

  // Save article
  const handleSave = useCallback(async () => {
    if (!form.title || !form.slug || !form.content) {
      alert("Title, slug, and content are required.");
      return;
    }
    setSaving(true);
    setSaveMessage("");
    try {
      const method = isNew ? "POST" : "PATCH";
      const url = isNew ? "/api/admin/articles" : `/api/admin/articles/${articleId}`;
      const body = {
        ...form,
        publishedAt: form.isPublished ? new Date().toISOString() : null,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save");
      }
      const saved = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      setSaveMessage("Saved successfully!");
      if (isNew && saved.id) {
        setLocation(`/admin/blog/${saved.id}`);
      }
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  }, [form, isNew, articleId, queryClient, setLocation]);

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Admin
            </Button>
            <span className="text-sm text-gray-500">
              {isNew ? "New Article" : `Editing: ${form.title || "Untitled"}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className="text-sm text-green-600 font-medium">{saveMessage}</span>
            )}
            {form.slug && !isNew && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/blog/${form.slug}`, "_blank")}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Label htmlFor="publish-toggle" className="text-sm">
                {form.isPublished ? "Published" : "Draft"}
              </Label>
              <Switch
                id="publish-toggle"
                checked={form.isPublished}
                onCheckedChange={(checked) => handleChange("isPublished", checked)}
              />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Cover Image */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cover Image</CardTitle>
          </CardHeader>
          <CardContent>
            {form.coverImageUrl ? (
              <div className="relative group">
                <img
                  src={form.coverImageUrl}
                  alt="Cover"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleChange("coverImageUrl", "")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                onClick={() => coverInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleCoverDrop}
              >
                {coverUploading ? (
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Click or drag & drop to upload a cover image
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            {/* Manual URL option */}
            <div className="mt-2">
              <Input
                placeholder="Or paste an image URL..."
                value={form.coverImageUrl}
                onChange={(e) => handleChange("coverImageUrl", e.target.value)}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Title & Slug */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Article title..."
                className="text-lg font-semibold mt-1"
              />
            </div>
            <div>
              <Label htmlFor="slug">
                URL Slug
                <span className="text-xs text-gray-400 ml-2">/blog/{form.slug || "..."}</span>
              </Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  handleChange("slug", slugify(e.target.value));
                }}
                placeholder="article-url-slug"
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="excerpt">Excerpt / Summary</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => handleChange("excerpt", e.target.value)}
                placeholder="Brief summary shown in article cards..."
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Article Content</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={form.content}
              onChange={(html) => handleChange("content", html)}
              onImageUpload={uploadImage}
              placeholder="Start writing your article..."
            />
          </CardContent>
        </Card>

        {/* SEO Settings (Collapsible) */}
        <Card>
          <CardHeader
            className="pb-3 cursor-pointer select-none"
            onClick={() => setShowSeo(!showSeo)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">SEO Settings</CardTitle>
              {showSeo ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </CardHeader>
          {showSeo && (
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">
                  Meta Title
                  <span className="text-xs text-gray-400 ml-2">
                    {form.metaTitle.length}/60 characters
                  </span>
                </Label>
                <Input
                  id="metaTitle"
                  value={form.metaTitle}
                  onChange={(e) => handleChange("metaTitle", e.target.value)}
                  placeholder="SEO title (defaults to article title)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">
                  Meta Description
                  <span className="text-xs text-gray-400 ml-2">
                    {form.metaDescription.length}/160 characters
                  </span>
                </Label>
                <Textarea
                  id="metaDescription"
                  value={form.metaDescription}
                  onChange={(e) => handleChange("metaDescription", e.target.value)}
                  placeholder="SEO description for search results..."
                  rows={2}
                  className="mt-1"
                />
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
