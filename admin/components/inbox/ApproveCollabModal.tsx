"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2, Search, Sparkles, User, UserCheck, X } from "lucide-react";
import { api, ApiError } from "@/lib/api/client";
import type { CollabApplication } from "@/lib/api/types";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type CustomerSummary = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  collaborator?: { id: string; name: string; referralCode: string | null } | null;
};

type LookupData = {
  application: CollabApplication;
  matchedCustomer: CustomerSummary | null;
  suggestedCollaborator: { id: string; name: string; role: string; handle: string | null } | null;
  availableCollaborators: { id: string; name: string; role: string; handle: string | null; referralCode: string | null }[];
};

export default function ApproveCollabModal({
  application,
  onClose,
  onApproved,
}: {
  application: CollabApplication;
  onClose: () => void;
  onApproved: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [lookup, setLookup] = useState<LookupData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string>("");
  const [commissionRate, setCommissionRate] = useState<number>(10);

  // Manual customer search
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CustomerSummary[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Load lookup data
  useEffect(() => {
    let active = true;
    setLoading(true);
    api<LookupData>("GET", `/admin/inbox/applications/${application.id}/lookup`)
      .then((data) => {
        if (!active) return;
        setLookup(data);
        if (data.matchedCustomer) {
          setSelectedCustomer(data.matchedCustomer);
        } else {
          setShowSearch(true);
        }
        if (data.suggestedCollaborator) {
          setSelectedCollaboratorId(data.suggestedCollaborator.id);
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : "Failed to load approval details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [application.id]);

  // Debounced customer search
  useEffect(() => {
    if (!showSearch || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearching(true);
      api<CustomerSummary[]>("GET", `/admin/customers?q=${encodeURIComponent(searchQuery.trim())}&take=10`)
        .then((res) => setSearchResults(res))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, showSearch]);

  const isAlreadyLinked = Boolean(selectedCustomer?.collaborator);

  async function handleApprove() {
    if (!selectedCustomer) {
      setError("Please select a customer account to link.");
      return;
    }
    if (isAlreadyLinked) {
      setError(`This customer is already linked to collaborator "${selectedCustomer.collaborator?.name}".`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api("POST", `/admin/inbox/applications/${application.id}/approve`, {
        customerId: selectedCustomer.id,
        collaboratorId: selectedCollaboratorId || undefined,
        commissionRate,
      });
      onApproved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to approve application.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Approve Collab Application"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[var(--radius-card)] bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-series-1/10 text-series-1">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h2 className="text-[0.95rem] font-semibold text-ink">Approve Collab Application</h2>
              <p className="text-[0.72rem] text-muted">
                {application.name} · {application.handle}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink">
            <X className="size-5" />
          </button>
        </header>

        <div className="space-y-5 overflow-y-auto p-6 text-[0.82rem]">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto size-6 animate-spin text-series-1" />
              <p className="mt-2 text-muted">Checking customer records…</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-critical/30 bg-critical/5 p-3 text-[0.78rem] text-critical">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Customer Link Section */}
              <div className="rounded-lg border border-hairline bg-surface/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="label-caps text-[0.68rem] text-ink-2 font-medium">Linked Customer Account</span>
                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={() => setShowSearch((v) => !v)}
                      className="text-[0.72rem] font-medium text-series-1 hover:underline"
                    >
                      {showSearch ? "Cancel change" : "Change customer"}
                    </button>
                  )}
                </div>

                {selectedCustomer && !showSearch ? (
                  <div className="mt-2.5 flex items-start justify-between rounded-md border border-hairline bg-card p-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink flex items-center gap-1.5">
                        <UserCheck className="size-3.5 text-good" />
                        {selectedCustomer.name}
                      </p>
                      <p className="text-[0.75rem] text-muted">{selectedCustomer.email}</p>
                    </div>
                    {isAlreadyLinked ? (
                      <Badge tone="critical">Already a collaborator</Badge>
                    ) : (
                      <Badge tone="good">Eligible</Badge>
                    )}
                  </div>
                ) : (
                  <div className="mt-2.5 space-y-3">
                    {!selectedCustomer && (
                      <p className="text-[0.75rem] text-amber-600 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-md">
                        No customer account matches <strong>{application.email}</strong>. Search and pick an existing customer account below:
                      </p>
                    )}

                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search customer by name or email…"
                        className="w-full rounded-md border border-hairline bg-card py-2 pr-3 pl-8 text-[0.8rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
                        autoFocus={!selectedCustomer}
                      />
                      {searching && <Loader2 className="absolute top-1/2 right-3 size-3.5 -translate-y-1/2 animate-spin text-muted" />}
                    </div>

                    {searchResults.length > 0 && (
                      <ul className="max-h-44 overflow-y-auto divide-y divide-hairline rounded-md border border-hairline bg-card">
                        {searchResults.map((cust) => {
                          const linked = Boolean(cust.collaborator);
                          return (
                            <li key={cust.id}>
                              <button
                                type="button"
                                disabled={linked}
                                onClick={() => {
                                  setSelectedCustomer(cust);
                                  setShowSearch(false);
                                  setError(null);
                                }}
                                className={cn(
                                  "flex w-full items-center justify-between p-2.5 text-left transition-colors",
                                  linked ? "opacity-50 cursor-not-allowed bg-muted/5" : "hover:bg-surface",
                                )}
                              >
                                <div className="min-w-0">
                                  <p className="text-[0.78rem] font-medium text-ink">{cust.name}</p>
                                  <p className="text-[0.72rem] text-muted">{cust.email}</p>
                                </div>
                                {linked ? (
                                  <Badge tone="critical">Already collaborator</Badge>
                                ) : (
                                  <span className="text-[0.72rem] font-medium text-series-1">Select</span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                {isAlreadyLinked && (
                  <p className="mt-2 text-[0.72rem] text-critical">
                    This customer is already assigned to collaborator &ldquo;{selectedCustomer?.collaborator?.name}&rdquo;. You cannot link two collaborators to the same user.
                  </p>
                )}
              </div>

              {/* 2. Collaborator Profile Option */}
              <div className="rounded-lg border border-hairline bg-surface/40 p-4 space-y-3">
                <span className="label-caps text-[0.68rem] text-ink-2 font-medium">Collaborator Profile</span>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="collab-profile"
                      checked={!selectedCollaboratorId}
                      onChange={() => setSelectedCollaboratorId("")}
                      className="text-series-1 focus:ring-series-1"
                    />
                    <span className="text-ink">
                      Create new Collaborator profile as <strong>{application.name}</strong> ({application.handle})
                    </span>
                  </label>

                  {lookup?.availableCollaborators && lookup.availableCollaborators.length > 0 && (
                    <div className="pt-1">
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input
                          type="radio"
                          name="collab-profile"
                          checked={Boolean(selectedCollaboratorId)}
                          onChange={() => {
                            if (lookup.availableCollaborators[0]) {
                              setSelectedCollaboratorId(lookup.availableCollaborators[0].id);
                            }
                          }}
                          className="text-series-1 focus:ring-series-1"
                        />
                        <span className="text-ink">Link to an existing display-only profile:</span>
                      </label>

                      {selectedCollaboratorId && (
                        <select
                          value={selectedCollaboratorId}
                          onChange={(e) => setSelectedCollaboratorId(e.target.value)}
                          className="w-full rounded-md border border-hairline bg-card py-2 px-3 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none"
                        >
                          {lookup.availableCollaborators.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.role}){c.handle ? ` · ${c.handle}` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Commission Rate */}
              <div className="flex items-center justify-between rounded-lg border border-hairline bg-surface/40 p-4">
                <div>
                  <label htmlFor="commission-rate" className="font-medium text-ink block">
                    Commission Rate (%)
                  </label>
                  <p className="text-[0.72rem] text-muted">Default is 10%. Percentage applied to referred orders.</p>
                </div>
                <div className="flex items-center gap-1.5 w-24">
                  <input
                    id="commission-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value) || 0)}
                    className="w-full rounded-md border border-hairline bg-card py-1.5 px-2.5 text-center text-[0.85rem] font-semibold text-ink focus:border-series-1 focus:outline-none"
                  />
                  <span className="text-muted font-medium">%</span>
                </div>
              </div>

              {/* Summary of actions */}
              <div className="rounded-lg bg-series-1/5 border border-series-1/20 p-3.5 text-[0.75rem] text-ink-2 space-y-1">
                <p className="font-semibold text-series-1 flex items-center gap-1">
                  <Sparkles className="size-3.5" /> What happens when you approve:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-ink/80 pt-1">
                  <li>Generates a unique readable referral code (e.g. <code>{application.name.split(" ")[0]?.toUpperCase()}4X8Q</code>)</li>
                  <li>Links collaborator to <strong>{selectedCustomer ? selectedCustomer.email : "selected customer"}</strong></li>
                  <li>Marks this application as <strong>reviewed</strong></li>
                  <li>Sends approval confirmation email with their referral code and dashboard link</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-hairline bg-surface/20 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-hairline px-4 py-2 text-[0.78rem] font-medium text-ink-2 hover:bg-surface disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || submitting || !selectedCustomer || isAlreadyLinked}
            onClick={handleApprove}
            className="inline-flex items-center gap-2 rounded-lg bg-series-1 px-4 py-2 text-[0.78rem] font-medium text-white shadow-sm transition-colors hover:bg-series-1/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {submitting ? "Approving…" : "Confirm & Approve"}
          </button>
        </footer>
      </div>
    </div>
  );
}
