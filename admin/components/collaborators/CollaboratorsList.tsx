"use client";

import Image from "next/image";
import { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Edit2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { Collaborator } from "@/lib/api/types";
import { api, ApiError } from "@/lib/api/client";
import { inrPaise } from "@/lib/utils";
import CollaboratorModal from "./CollaboratorModal";

export default function CollaboratorsList({
  initial,
  isSuperAdmin = false,
}: {
  initial: Collaborator[];
  isSuperAdmin?: boolean;
}) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initial);
  const [search, setSearch] = useState("");

  // Modal state (create or edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);

  // Delete state
  const [deletingCollaborator, setDeletingCollaborator] = useState<Collaborator | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Inline commission rate edit
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editRateValue, setEditRateValue] = useState<string>("");
  const [savingRate, setSavingRate] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  // Filtered list
  const filtered = collaborators.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.role && c.role.toLowerCase().includes(q)) ||
      (c.referralCode && c.referralCode.toLowerCase().includes(q)) ||
      (c.quote && c.quote.toLowerCase().includes(q)) ||
      (c.user?.name && c.user.name.toLowerCase().includes(q)) ||
      (c.user?.email && c.user.email.toLowerCase().includes(q))
    );
  });

  function openCreateModal() {
    setSelectedCollaborator(null);
    setIsModalOpen(true);
    setDeleteError(null);
  }

  function openEditModal(c: Collaborator) {
    setSelectedCollaborator(c);
    setIsModalOpen(true);
    setDeleteError(null);
  }

  function handleCollaboratorSaved(saved: Collaborator) {
    setCollaborators((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      if (exists) {
        return prev.map((c) => (c.id === saved.id ? { ...c, ...saved } : c));
      }
      return [saved, ...prev];
    });
    setFeedbackMessage(
      selectedCollaborator
        ? `Updated details for ${saved.name}.`
        : `Created collaborator ${saved.name}.`,
    );
    setTimeout(() => setFeedbackMessage(null), 4000);
  }

  function startEditRate(c: Collaborator) {
    setEditingRateId(c.id);
    setEditRateValue(String(c.commissionRate));
    setRateError(null);
  }

  async function saveCommissionRate(c: Collaborator) {
    const rate = parseFloat(editRateValue);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setRateError("Rate must be between 0% and 100%.");
      return;
    }

    setSavingRate(true);
    setRateError(null);
    try {
      const updated = await api<Collaborator>("PATCH", `/admin/collaborators/${c.id}`, {
        commissionRate: rate,
      });

      setCollaborators((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, commissionRate: updated.commissionRate } : item)),
      );
      setEditingRateId(null);
    } catch (err) {
      setRateError((err as Error).message || "Failed to update rate.");
    } finally {
      setSavingRate(false);
    }
  }

  async function confirmDelete() {
    if (!deletingCollaborator) return;
    setDeleteBusy(true);
    setDeleteError(null);

    try {
      await api("DELETE", `/admin/collaborators/${deletingCollaborator.id}`);
      setCollaborators((prev) => prev.filter((c) => c.id !== deletingCollaborator.id));
      setFeedbackMessage(`Deleted collaborator “${deletingCollaborator.name}”.`);
      setTimeout(() => setFeedbackMessage(null), 4000);
      setDeletingCollaborator(null);
    } catch (err) {
      // If delete is blocked (e.g. 409 Conflict due to existing referrals or redeem requests)
      if (err instanceof ApiError) {
        setDeleteError(err.message);
      } else {
        setDeleteError((err as Error).message || "Could not delete collaborator.");
      }
      setDeletingCollaborator(null);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top filter & Add button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, code, or customer..."
            className="w-full rounded-md border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted">
            Showing <strong>{filtered.length}</strong> of {collaborators.length}
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openCreateModal}
          >
            <Plus className="size-3.5" />
            Add Collaborator
          </Button>
        </div>
      </div>

      {/* Success banner */}
      {feedbackMessage && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="rounded p-1 hover:bg-emerald-500/20"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Delete blocked or action warning */}
      {deleteError && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-critical/40 bg-critical/10 p-3.5 text-xs text-critical">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-4.5 shrink-0 mt-0.5 text-critical" />
            <div>
              <p className="font-semibold text-critical">Delete Blocked</p>
              <p className="mt-0.5 text-foreground/90">{deleteError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="rounded p-1 text-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {rateError && (
        <div className="flex items-center gap-2 rounded-md border border-critical/30 bg-critical/10 p-3 text-xs text-critical">
          <AlertCircle className="size-4 shrink-0" />
          <span>{rateError}</span>
        </div>
      )}

      {/* Collaborators Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[0.68rem] uppercase tracking-wider text-muted font-semibold">
              <th className="py-3 px-4">Collaborator</th>
              <th className="py-3 px-4">Linked Customer</th>
              <th className="py-3 px-4">Referral Code</th>
              <th className="py-3 px-4">Commission %</th>
              <th className="py-3 px-4 text-right">Clicks</th>
              <th className="py-3 px-4 text-right">Orders</th>
              <th className="py-3 px-4 text-right">Pending</th>
              <th className="py-3 px-4 text-right">Approved</th>
              <th className="py-3 px-4 text-right">Redeemed</th>
              <th className="py-3 px-4 text-right">Net Balance</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-muted">
                  No collaborators match your search.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const isEditingRate = editingRateId === c.id;
                const netBalance = c.netBalancePaise ?? 0;
                const isNegative = netBalance < 0;

                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    {/* Collaborator info with Quote and SortOrder */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted mt-0.5">
                          {c.avatarUrl ? (
                            <Image src={c.avatarUrl} alt={c.name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="flex size-full items-center justify-center text-xs font-semibold text-muted">
                              {c.name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-foreground">{c.name}</p>
                            <span className="rounded bg-muted/70 px-1.5 py-0.2 text-[0.65rem] text-muted font-mono">
                              #{c.sortOrder ?? 0}
                            </span>
                          </div>
                          <p className="text-[0.7rem] text-muted">{c.role}</p>
                          {c.quote && (
                            <p
                              className="mt-1 line-clamp-2 italic text-[0.68rem] text-muted-foreground/90 leading-tight"
                              title={c.quote}
                            >
                              &ldquo;{c.quote}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Linked Customer */}
                    <td className="py-3 px-4">
                      {c.user ? (
                        <div>
                          <p className="font-medium text-foreground">{c.user.name}</p>
                          <p className="text-[0.7rem] text-muted font-mono">{c.user.email}</p>
                        </div>
                      ) : (
                        <Badge tone="neutral">Unlinked</Badge>
                      )}
                    </td>

                    {/* Referral Code */}
                    <td className="py-3 px-4">
                      {c.referralCode ? (
                        <span className="font-mono font-semibold text-primary">{c.referralCode}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* Commission Rate (Editable by Super Admin only) */}
                    <td className="py-3 px-4">
                      {isSuperAdmin ? (
                        isEditingRate ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={editRateValue}
                              onChange={(e) => setEditRateValue(e.target.value)}
                              disabled={savingRate}
                              className="w-16 rounded border border-primary px-2 py-1 text-xs font-semibold text-foreground focus:outline-none"
                              autoFocus
                            />
                            <span className="text-xs font-medium">%</span>
                            <button
                              type="button"
                              onClick={() => saveCommissionRate(c)}
                              disabled={savingRate}
                              className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                              title="Save rate"
                            >
                              {savingRate ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRateId(null)}
                              disabled={savingRate}
                              className="rounded p-1 text-muted hover:bg-muted"
                              title="Cancel"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditRate(c)}
                            className="group flex items-center gap-1.5 rounded px-2 py-1 hover:bg-muted/60 transition-colors font-medium text-foreground"
                            title="Click to edit commission rate"
                          >
                            <span>{c.commissionRate}%</span>
                            <Edit2 className="size-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )
                      ) : (
                        <span className="px-2 py-1 font-medium text-foreground">{c.commissionRate}%</span>
                      )}
                    </td>

                    {/* Clicks */}
                    <td className="py-3 px-4 text-right font-medium">
                      {(c.clicks ?? 0).toLocaleString("en-IN")}
                    </td>

                    {/* Orders */}
                    <td className="py-3 px-4 text-right font-medium">
                      {(c.orders ?? 0).toLocaleString("en-IN")}
                    </td>

                    {/* Pending */}
                    <td className="py-3 px-4 text-right text-muted">
                      {inrPaise(c.pendingPaise ?? 0)}
                    </td>

                    {/* Approved */}
                    <td className="py-3 px-4 text-right text-foreground font-medium">
                      {inrPaise(c.approvedPaise ?? 0)}
                    </td>

                    {/* Redeemed */}
                    <td className="py-3 px-4 text-right text-muted">
                      {inrPaise(c.redeemedPaise ?? 0)}
                    </td>

                    {/* Net Balance (Flagged in red if negative) */}
                    <td className="py-3 px-4 text-right">
                      {isNegative ? (
                        <span className="inline-flex items-center gap-1 rounded bg-critical/15 px-2 py-0.5 text-xs font-bold text-critical">
                          <AlertCircle className="size-3" />
                          {inrPaise(netBalance)}
                        </span>
                      ) : (
                        <span className="font-semibold text-foreground">
                          {inrPaise(netBalance)}
                        </span>
                      )}
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="grid size-7 place-items-center rounded border border-border text-muted hover:border-primary hover:text-primary transition-colors"
                          title="Edit collaborator"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCollaborator(c)}
                          className="grid size-7 place-items-center rounded border border-border text-muted hover:border-critical hover:text-critical transition-colors"
                          title="Delete collaborator"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Collaborator Create/Edit Modal */}
      <CollaboratorModal
        isOpen={isModalOpen}
        collaborator={selectedCollaborator}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleCollaboratorSaved}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Delete Confirmation Dialog */}
      {deletingCollaborator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => !deleteBusy && setDeletingCollaborator(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-critical/10 text-critical">
                <Trash2 className="size-4.5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Delete Collaborator?
                </h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-foreground">{deletingCollaborator.name}</strong>?
                  This action cannot be undone.
                </p>
                {((deletingCollaborator.orders ?? 0) > 0 || (deletingCollaborator.netBalancePaise ?? 0) !== 0) && (
                  <div className="mt-2.5 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-[0.72rem] text-amber-700 dark:text-amber-300">
                    <strong>Note:</strong> Collaborators with recorded referral orders or payout history are protected and cannot be deleted.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deleteBusy}
                onClick={() => setDeletingCollaborator(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={deleteBusy}
                onClick={confirmDelete}
              >
                {deleteBusy ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Collaborator"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
