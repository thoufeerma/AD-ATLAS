"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AlertCircle, Loader2, Sparkles, User, X } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Collaborator } from "@/lib/api/types";
import { api, ApiError } from "@/lib/api/client";

type Props = {
  isOpen: boolean;
  collaborator: Collaborator | null; // null => Create, object => Edit
  onClose: () => void;
  onSaved: (saved: Collaborator) => void;
  isSuperAdmin?: boolean;
};

export default function CollaboratorModal({
  isOpen,
  collaborator,
  onClose,
  onSaved,
  isSuperAdmin = false,
}: Props) {
  const isEditing = Boolean(collaborator);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [quote, setQuote] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [commissionRate, setCommissionRate] = useState("10");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when modal opens or collaborator changes
  useEffect(() => {
    if (!isOpen) return;
    if (collaborator) {
      setName(collaborator.name || "");
      setRole(collaborator.role || "");
      setAvatarUrl(collaborator.avatarUrl || "");
      setQuote(collaborator.quote || "");
      setSortOrder(String(collaborator.sortOrder ?? 0));
      setCommissionRate(String(collaborator.commissionRate ?? 10));
    } else {
      setName("");
      setRole("");
      setAvatarUrl("");
      setQuote("");
      setSortOrder("0");
      setCommissionRate("10");
    }
    setError(null);
  }, [isOpen, collaborator]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, busy, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    const trimmedAvatar = avatarUrl.trim();
    const trimmedQuote = quote.trim();
    const parsedOrder = parseInt(sortOrder, 10);
    const parsedRate = parseFloat(commissionRate);

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (trimmedRole.length < 2) {
      setError("Role must be at least 2 characters.");
      return;
    }
    if (trimmedAvatar && !trimmedAvatar.startsWith("https://")) {
      setError("Avatar URL must begin with https:// (secure URLs only).");
      return;
    }
    if (isNaN(parsedOrder)) {
      setError("Sort order must be an integer.");
      return;
    }
    if (isSuperAdmin && (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100)) {
      setError("Commission rate must be between 0% and 100%.");
      return;
    }

    const payload: Record<string, unknown> = {
      name: trimmedName,
      role: trimmedRole,
      avatarUrl: trimmedAvatar || null,
      quote: trimmedQuote || null,
      sortOrder: parsedOrder,
    };
    if (isSuperAdmin) {
      payload.commissionRate = parsedRate;
    }

    setBusy(true);
    try {
      if (isEditing && collaborator) {
        const updated = await api<Collaborator>(
          "PATCH",
          `/admin/collaborators/${collaborator.id}`,
          payload,
        );
        onSaved({
          ...collaborator,
          ...updated,
        });
      } else {
        const created = await api<Collaborator>(
          "POST",
          "/admin/collaborators",
          payload,
        );
        onSaved(created);
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to save collaborator.");
      } else {
        setError((err as Error).message || "Could not save collaborator.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="collaborator-modal-title"
        className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <User className="size-4" />
            </div>
            <div>
              <h2 id="collaborator-modal-title" className="text-sm font-semibold text-foreground">
                {isEditing ? `Edit Collaborator: ${collaborator?.name}` : "Add New Collaborator"}
              </h2>
              <p className="text-[0.72rem] text-muted">
                {isEditing
                  ? "Update name, role, quote, photo or display priority"
                  : "Create a collaborator without needing a linked customer"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md p-1.5 text-muted hover:bg-muted/80 hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-5 text-xs">
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-critical/40 bg-critical/10 p-3 text-critical">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isEditing && (
            <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-[0.72rem] text-foreground/90">
              <span className="font-semibold text-primary">No customer account required:</span> You can add display-only creators for the storefront right away. An account can be linked later when they apply.
            </div>
          )}

          {isEditing && collaborator?.user && (
            <div className="rounded-md border border-border bg-muted/40 p-2.5 text-[0.72rem] flex items-center justify-between">
              <div>
                <span className="text-muted">Linked Customer: </span>
                <span className="font-medium text-foreground">{collaborator.user.name}</span>
                <span className="text-muted font-mono ml-1">({collaborator.user.email})</span>
              </div>
              {collaborator.referralCode && (
                <span className="font-mono text-primary font-semibold text-[0.7rem]">
                  Code: {collaborator.referralCode}
                </span>
              )}
            </div>
          )}

          {/* Name & Role */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-medium text-foreground mb-1">
                Full Name <span className="text-critical">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sakshi Gupta"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">
                Role / Title <span className="text-critical">*</span>
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Makeup Artist"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Avatar URL (HTTPS only) */}
          <div>
            <label className="block font-medium text-foreground mb-1">
              Avatar Image URL <span className="text-[0.68rem] font-normal text-muted">(https:// required)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                {avatarUrl && avatarUrl.startsWith("https://") ? (
                  <Image src={avatarUrl} alt="Avatar preview" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex size-full items-center justify-center font-bold text-muted">
                    {name ? name.slice(0, 1).toUpperCase() : "?"}
                  </div>
                )}
              </div>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://..."
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Quote */}
          <div>
            <label className="block font-medium text-foreground mb-1">
              Quote / Testimonial
              <span className="text-[0.68rem] font-normal text-muted ml-1">
                (Shown under &ldquo;What Our Collaborators Say&rdquo;)
              </span>
            </label>
            <textarea
              rows={3}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="e.g. Velastia's lightweight textures are a staple in my daily vanity kit..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Sort Order & Commission Rate */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-medium text-foreground mb-1">
                Display Order <span className="text-[0.68rem] font-normal text-muted">(0 = first)</span>
              </label>
              <input
                type="number"
                step="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            {isSuperAdmin ? (
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Commission Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 pr-8 text-foreground focus:border-primary focus:outline-none"
                  />
                  <span className="pointer-events-none absolute right-3 top-1.5 text-muted font-medium">
                    %
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Commission Rate
                </label>
                <div className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-muted text-xs">
                  {collaborator ? `${collaborator.commissionRate}%` : "10% (Default)"}
                  <span className="text-[0.65rem] text-muted block">Super Admin only</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={busy}
            >
              {busy ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Collaborator"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
