import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  Link2,
  ExternalLink,
  Settings,
  KeyRound,
  ImageIcon,
  Upload,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Star } from "lucide-react";
import type { State, Article, InsertState, InsertArticle, Resource, InsertResource } from "@shared/schema";

function StateForm({
  state,
  onClose,
}: {
  state?: State;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const isEdit = !!state;

  const [formData, setFormData] = useState<Partial<InsertState>>({
    name: state?.name || "",
    abbreviation: state?.abbreviation || "",
    slug: state?.slug || "",
    description: state?.description || "",
    metaTitle: state?.metaTitle || "",
    metaDescription: state?.metaDescription || "",
    heroImageUrl: state?.heroImageUrl || "",
    agencyName: state?.agencyName || "",
    agencyAbbreviation: state?.agencyAbbreviation || "",
    minimumAge: state?.minimumAge ?? undefined,
    minimumAgeOnlineOnly: state?.minimumAgeOnlineOnly ?? undefined,
    fieldDayRequired: state?.fieldDayRequired ?? true,
    fieldDayDetails: state?.fieldDayDetails || "",
    courseUrl: state?.courseUrl || "",
    coursePrice: state?.coursePrice || "",
    additionalRequirements: state?.additionalRequirements || "",
    importantNotes: state?.importantNotes || "",
    isActive: state?.isActive ?? true,
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<InsertState>) => {
      if (isEdit) {
        return apiRequest("PATCH", `/api/admin/states/${state.id}`, data);
      }
      return apiRequest("POST", "/api/admin/states", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/states"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/states"] });
      toast({ title: isEdit ? "State updated" : "State created" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      minimumAge: formData.minimumAge ? Number(formData.minimumAge) : null,
      minimumAgeOnlineOnly: formData.minimumAgeOnlineOnly ? Number(formData.minimumAgeOnlineOnly) : null,
    };
    mutation.mutate(submitData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isEdit && formData.name) {
      updateField(
        "slug",
        formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }, [formData.name, isEdit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">State Name *</Label>
          <Input id="name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} required data-testid="input-state-name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="abbreviation">Abbreviation *</Label>
          <Input id="abbreviation" maxLength={2} value={formData.abbreviation} onChange={(e) => updateField("abbreviation", e.target.value.toUpperCase())} required data-testid="input-state-abbreviation" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">URL Slug *</Label>
        <Input id="slug" value={formData.slug} onChange={(e) => updateField("slug", e.target.value)} required data-testid="input-state-slug" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => updateField("description", e.target.value)} required rows={3} data-testid="input-state-description" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="agencyName">Agency Name *</Label>
          <Input id="agencyName" value={formData.agencyName} onChange={(e) => updateField("agencyName", e.target.value)} required data-testid="input-agency-name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="agencyAbbreviation">Agency Abbreviation</Label>
          <Input id="agencyAbbreviation" value={formData.agencyAbbreviation || ""} onChange={(e) => updateField("agencyAbbreviation", e.target.value)} data-testid="input-agency-abbreviation" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="minimumAge">Minimum Age</Label>
          <Input id="minimumAge" type="number" value={formData.minimumAge ?? ""} onChange={(e) => updateField("minimumAge", e.target.value ? Number(e.target.value) : undefined)} data-testid="input-minimum-age" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="minimumAgeOnlineOnly">Min Age (Online Only)</Label>
          <Input id="minimumAgeOnlineOnly" type="number" value={formData.minimumAgeOnlineOnly ?? ""} onChange={(e) => updateField("minimumAgeOnlineOnly", e.target.value ? Number(e.target.value) : undefined)} data-testid="input-min-age-online" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="fieldDayRequired" checked={formData.fieldDayRequired} onCheckedChange={(checked) => updateField("fieldDayRequired", checked)} data-testid="switch-field-day" />
        <Label htmlFor="fieldDayRequired">Field Day Required</Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fieldDayDetails">Field Day Details</Label>
        <Textarea id="fieldDayDetails" value={formData.fieldDayDetails || ""} onChange={(e) => updateField("fieldDayDetails", e.target.value)} rows={2} data-testid="input-field-day-details" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="courseUrl">Course URL</Label>
          <Input id="courseUrl" value={formData.courseUrl || ""} onChange={(e) => updateField("courseUrl", e.target.value)} data-testid="input-course-url" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="coursePrice">Course Price</Label>
          <Input id="coursePrice" value={formData.coursePrice || ""} onChange={(e) => updateField("coursePrice", e.target.value)} data-testid="input-course-price" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="heroImageUrl">Hero Image URL</Label>
        <Input id="heroImageUrl" value={formData.heroImageUrl || ""} onChange={(e) => updateField("heroImageUrl", e.target.value)} data-testid="input-hero-image" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="additionalRequirements">Additional Requirements</Label>
        <Textarea id="additionalRequirements" value={formData.additionalRequirements || ""} onChange={(e) => updateField("additionalRequirements", e.target.value)} rows={3} data-testid="input-additional-requirements" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="importantNotes">Important Notes</Label>
        <Textarea id="importantNotes" value={formData.importantNotes || ""} onChange={(e) => updateField("importantNotes", e.target.value)} rows={3} data-testid="input-important-notes" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="metaTitle">SEO Title</Label>
          <Input id="metaTitle" value={formData.metaTitle || ""} onChange={(e) => updateField("metaTitle", e.target.value)} data-testid="input-meta-title" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="metaDescription">SEO Description</Label>
          <Input id="metaDescription" value={formData.metaDescription || ""} onChange={(e) => updateField("metaDescription", e.target.value)} data-testid="input-meta-description" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => updateField("isActive", checked)} data-testid="switch-is-active" />
        <Label htmlFor="isActive">Active (visible on site)</Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-state">
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending} data-testid="button-save-state">
          {mutation.isPending ? "Saving..." : isEdit ? "Update State" : "Create State"}
        </Button>
      </div>
    </form>
  );
}

function ArticleForm({
  article,
  onClose,
}: {
  article?: Article;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const isEdit = !!article;

  const [formData, setFormData] = useState<Partial<InsertArticle>>({
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    metaTitle: article?.metaTitle || "",
    metaDescription: article?.metaDescription || "",
    coverImageUrl: article?.coverImageUrl || "",
    isPublished: article?.isPublished ?? false,
    publishedAt: article?.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 16) as any : null,
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<InsertArticle>) => {
      if (isEdit) {
        return apiRequest("PATCH", `/api/admin/articles/${article.id}`, data);
      }
      return apiRequest("POST", "/api/admin/articles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({ title: isEdit ? "Article updated" : "Article created" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      publishedAt: formData.publishedAt ? new Date(formData.publishedAt as any).toISOString() : null,
    };
    mutation.mutate(submitData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isEdit && formData.title) {
      updateField(
        "slug",
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }, [formData.title, isEdit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={formData.title} onChange={(e) => updateField("title", e.target.value)} required data-testid="input-article-title" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">URL Slug *</Label>
        <Input id="slug" value={formData.slug} onChange={(e) => updateField("slug", e.target.value)} required data-testid="input-article-slug" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Excerpt *</Label>
        <Textarea id="excerpt" value={formData.excerpt} onChange={(e) => updateField("excerpt", e.target.value)} required rows={2} data-testid="input-article-excerpt" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">Content (HTML) *</Label>
        <Textarea id="content" value={formData.content} onChange={(e) => updateField("content", e.target.value)} required rows={10} className="font-mono text-sm" data-testid="input-article-content" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="coverImageUrl">Cover Image URL</Label>
        <Input id="coverImageUrl" value={formData.coverImageUrl || ""} onChange={(e) => updateField("coverImageUrl", e.target.value)} data-testid="input-article-cover" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="metaTitle">SEO Title</Label>
          <Input id="metaTitle" value={formData.metaTitle || ""} onChange={(e) => updateField("metaTitle", e.target.value)} data-testid="input-article-meta-title" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="metaDescription">SEO Description</Label>
          <Input id="metaDescription" value={formData.metaDescription || ""} onChange={(e) => updateField("metaDescription", e.target.value)} data-testid="input-article-meta-description" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="isPublished" checked={formData.isPublished ?? false} onCheckedChange={(checked) => {
          updateField("isPublished", checked);
          if (checked && !formData.publishedAt) {
            updateField("publishedAt", new Date().toISOString().slice(0, 16));
          }
        }} data-testid="switch-is-published" />
        <Label htmlFor="isPublished">Published</Label>
      </div>

      {formData.isPublished && (
        <div className="space-y-1.5">
          <Label htmlFor="publishedAt">Publish Date</Label>
          <Input id="publishedAt" type="datetime-local" value={formData.publishedAt ? String(formData.publishedAt).slice(0, 16) : ""} onChange={(e) => updateField("publishedAt", e.target.value)} data-testid="input-published-at" />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-article">
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending} data-testid="button-save-article">
          {mutation.isPending ? "Saving..." : isEdit ? "Update Article" : "Create Article"}
        </Button>
      </div>
    </form>
  );
}

function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm mx-4">
        <CardContent className="pt-6">
          <h1 className="text-xl font-bold text-center mb-6">Admin Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ResourceForm({ resource, states, onClose }: { resource: Resource | null; states: State[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: resource?.title || "",
    url: resource?.url || "",
    description: resource?.description || "",
    resourceType: resource?.resourceType || "official_state_page",
    stateId: resource?.stateId || null,
    isActive: resource?.isActive !== false,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (resource?.id) {
        return await apiRequest("PATCH", `/api/admin/resources/${resource.id}`, data);
      }
      return await apiRequest("POST", "/api/admin/resources", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] });
      onClose();
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">URL</label>
        <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-md" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <select value={formData.stateId || "all"} onChange={(e) => setFormData({ ...formData, stateId: e.target.value === "all" ? null : parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-md">
            <option value="all">All States</option>
            {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select value={formData.resourceType} onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })} className="w-full px-3 py-2 border rounded-md">
            <option value="official_state_page">Official State Page</option>
            <option value="regulation">Regulation</option>
            <option value="faq">FAQ</option>
            <option value="course_provider">Course Provider</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
        <label htmlFor="isActive" className="text-sm">Active</label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save"}</Button>
      </div>
    </form>
  );
}

function SiteSettingsForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load current settings
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/site-settings");
      return res.json();
    },
  });

  useEffect(() => {
    if (settings?.site_hero_image) {
      setHeroImageUrl(settings.site_hero_image);
    }
  }, [settings]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ data: base64, filename: file.name, mimeType: file.type }),
        });
        if (res.ok) {
          const { url } = await res.json();
          setHeroImageUrl(url);
          toast({ title: "Image uploaded" });
        } else {
          toast({ title: "Upload failed", variant: "destructive" });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key: "site_hero_image", value: heroImageUrl }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
        toast({ title: "Hero image saved" });
      } else {
        toast({ title: "Failed to save", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ImageIcon className="h-5 w-5" />
        Home Page Hero Image
      </h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {heroImageUrl && (
            <div className="relative rounded-lg overflow-hidden border">
              <img src={heroImageUrl} alt="Hero preview" className="w-full h-48 object-cover" />
            </div>
          )}

          <div className="space-y-2">
            <Label>Upload New Image</Label>
            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button type="button" variant="outline" className="w-full" disabled={isUploading} asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Choose Image"}
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="heroUrl">Or enter image URL</Label>
            <Input
              id="heroUrl"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="/images/hero-boating.png"
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Hero Image"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ChangePasswordForm() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords don't match", variant: "destructive" });
      return;
    }

    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        toast({ title: "Password changed successfully" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.message || "Failed to change password", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to change password", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <KeyRound className="h-5 w-5" />
        Change Admin Password
      </h2>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: states, isLoading: statesLoading } = useQuery<State[]>({
    queryKey: ["/api/admin/states"],
    enabled: isAuthenticated,
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/admin/articles"],
    enabled: isAuthenticated,
  });

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/admin/resources"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/resources");
      return response.json();
    },
  });

  const [editingState, setEditingState] = useState<State | undefined>();
  const [stateDialogOpen, setStateDialogOpen] = useState(false);  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);

  const deleteStateMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/states/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/states"] });
      queryClient.invalidateQueries({ queryKey: ["/api/states"] });
      toast({ title: "State deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "Article deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const reorderArticlesMutation = useMutation({
    mutationFn: (orderedIds: number[]) =>
      apiRequest("POST", "/api/admin/articles/reorder", { orderedIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error reordering", description: err.message, variant: "destructive" });
    },
  });

  const [articleOrder, setArticleOrder] = useState<Article[]>([]);

  useEffect(() => {
    if (articles) setArticleOrder(articles);
  }, [articles]);

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: number; isFeatured: boolean }) =>
      apiRequest("PATCH", `/api/admin/articles/${id}`, { isFeatured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
  });

  const handleArticleReorder = useCallback(
    (newOrder: Article[]) => {
      setArticleOrder(newOrder);
      reorderArticlesMutation.mutate(newOrder.map((a) => a.id));
    },
    [reorderArticlesMutation]
  );

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/resources/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] }),
  });

  

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen">
      <section className="bg-card border-b py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-serif text-2xl font-bold sm:text-3xl" data-testid="text-admin-title">
            Content Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your state pages and blog articles.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Tabs defaultValue="states">
            <TabsList data-testid="tabs-admin">
              <TabsTrigger value="states" data-testid="tab-states">
                <MapPin className="h-4 w-4 mr-1" />
                States ({states?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="articles" data-testid="tab-articles">
                <FileText className="h-4 w-4 mr-1" />
                Articles ({articles?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Resources ({resources?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="states" className="mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                <h2 className="text-lg font-semibold">State Pages</h2>
                <Dialog open={stateDialogOpen} onOpenChange={(open) => {
                  setStateDialogOpen(open);
                  if (!open) setEditingState(undefined);
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-state">
                      <Plus className="h-4 w-4 mr-1" />
                      Add State
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingState ? "Edit State" : "Add New State"}</DialogTitle>
                    </DialogHeader>
                    <StateForm
                      state={editingState}
                      onClose={() => {
                        setStateDialogOpen(false);
                        setEditingState(undefined);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {statesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : states && states.length > 0 ? (
                <div className="space-y-2">
                  {states.map((state) => (
                    <Card key={state.id} data-testid={`admin-state-${state.id}`}>
                      <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge variant="secondary" className="flex-shrink-0">{state.abbreviation}</Badge>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{state.name}</p>
                            <p className="text-xs text-muted-foreground truncate">/{state.slug}</p>
                          </div>
                          {!state.isActive && (
                            <Badge variant="outline" className="flex-shrink-0">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingState(state);
                              setStateDialogOpen(true);
                            }}
                            data-testid={`button-edit-state-${state.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete ${state.name}?`)) {
                                deleteStateMutation.mutate(state.id);
                              }
                            }}
                            data-testid={`button-delete-state-${state.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No states added yet.</p>
                </div>
              )}
            </TabsContent>

        <TabsContent value="articles" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Blog Articles</h2>
                <Button onClick={() => window.location.href = '/admin/blog/new'}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Button>
              </div>

              {articlesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : articleOrder.length > 0 ? (
                <Reorder.Group
                  axis="y"
                  values={articleOrder}
                  onReorder={handleArticleReorder}
                  className="space-y-3"
                >
                  {articleOrder.map((article: Article) => (
                    <Reorder.Item key={article.id} value={article} className="list-none">
                      <Card className="overflow-hidden cursor-grab active:cursor-grabbing">
                        <div className="flex items-center p-4 gap-4">
                          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          {article.coverImageUrl && (
                            <img
                              src={article.coverImageUrl}
                              alt=""
                              className="w-20 h-14 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{article.title}</h3>
                            <p className="text-sm text-gray-500 truncate">/blog/{article.slug}</p>
                          </div>
                          <Badge variant={article.isPublished ? "default" : "secondary"}>
                            {article.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={article.isFeatured ? "Remove from homepage" : "Feature on homepage"}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFeaturedMutation.mutate({ id: article.id, isFeatured: !article.isFeatured });
                            }}
                          >
                            <Star className={`h-4 w-4 ${article.isFeatured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = '/admin/blog/' + article.id}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm('Delete "' + article.title + '"?')) {
                                  deleteArticleMutation.mutate(article.id);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <p className="text-center text-gray-500 py-8">No articles yet. Create your first one!</p>
              )}
            </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Resources</h2>
            <Button onClick={() => { setEditingResource(null); setResourceDialogOpen(true); }} className="bg-green-700 hover:bg-green-800">
              <Plus className="w-4 h-4 mr-2" /> Add Resource
            </Button>
          </div>

          <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingResource ? "Edit Resource" : "Add Resource"}</DialogTitle>
              </DialogHeader>
              <ResourceForm resource={editingResource} states={states} onClose={() => setResourceDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          <div className="space-y-2">
            {resources.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No resources yet. Add your first resource above.</p>
            ) : (
              resources.map((resource: Resource) => (
                <div key={resource.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline flex items-center gap-1">
                        {resource.title} <ExternalLink className="w-3 h-3" />
                      </a>
                      {!resource.isActive && <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">Inactive</span>}
                    </div>
                    {resource.description && <p className="text-sm text-gray-600 mt-1">{resource.description}</p>}
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>State: {resource.stateId ? states?.find((s: State) => s.id === resource.stateId)?.name || "Unknown" : "All States"}</span>
                      <span>Type: {resource.resourceType}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingResource(resource); setResourceDialogOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this resource?")) deleteResourceMutation.mutate(resource.id); }}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-8">
          <SiteSettingsForm />
          <hr />
          <ChangePasswordForm />
        </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
