import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, CheckCircle } from "lucide-react";
import type { State } from "@shared/schema";

export function ContactFormDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", state: "", message: "" });
  const { toast } = useToast();

  const { data: states } = useQuery<State[]>({
    queryKey: ["/api/states"],
  });

  const activeStates = states?.filter((s) => s.isActive).sort((a, b) => a.name.localeCompare(b.name)) || [];

  const submitMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/contact", form),
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: "", email: "", state: "", message: "" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    submitMutation.mutate();
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => setSubmitted(false), 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Us
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">Message Sent!</h3>
            <p className="text-muted-foreground text-sm">Thank you for reaching out. We'll get back to you soon.</p>
            <Button className="mt-4" onClick={() => handleOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="contact-name">Name *</Label>
              <Input
                id="contact-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Email *</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="contact-state">State of Residence</Label>
              <Select value={form.state} onValueChange={(val) => setForm({ ...form, state: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your state (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {activeStates.map((s) => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contact-message">Message *</Label>
              <Textarea
                id="contact-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help?"
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
