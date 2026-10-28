"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  Search,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { AdminRedeemRequest } from "@/lib/api/types";
import { api } from "@/lib/api/client";
import { cn, inrPaise } from "@/lib/utils";

type FilterStatus = "ALL" | "REQUESTED" | "APPROVED" | "REJECTED";

export default function RedeemRequestsView({
  initial,
  isSuperAdmin = false,
}: {
  initial: AdminRedeemRequest[];
  isSuperAdmin?: boolean;
}) {
  const [requests, setRequests] = useState<AdminRedeemRequest[]>(initial);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");

  // Processing modal state
  const [selectedReq, setSelectedReq] = useState<{
    request: AdminRedeemRequest;
    action: "approve" | "reject";
  } | null>(null);
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (filter !== "ALL" && r.status !== filter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        r.collaborator.name.toLowerCase().includes(q) ||
        (r.collaborator.referralCode && r.collaborator.referralCode.toLowerCase().includes(q)) ||
        (r.collaborator.user?.email && r.collaborator.user.email.toLowerCase().includes(q)) ||
        (r.note && r.note.toLowerCase().includes(q))
      );
    });
  }, [requests, filter, search]);

  function openActionModal(request: AdminRedeemRequest, action: "approve" | "reject") {
    if (!isSuperAdmin) return;
    setSelectedReq({ request, action });
    setNote("");
    setActionError(null);
  }

  async function handleConfirmAction() {
    if (!selectedReq || processing) return;
    setProcessing(true);
    setActionError(null);

    const { request, action } = selectedReq;
    const endpoint = `/admin/collaborators/redeems/${request.id}/${action}`;

    try {
      const res = await api<{ data: AdminRedeemRequest; alreadyProcessed: boolean }>(
        "POST",
        endpoint,
        { note: note.trim() || undefined },
      );

      // Update in local state
      setRequests((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? {
                ...item,
                status: action === "approve" ? "APPROVED" : "REJECTED",
                note: note.trim() || item.note,
              }
            : item,
        ),
      );

      setSelectedReq(null);
    } catch (err) {
      setActionError((err as Error).message || `Failed to ${action} request.`);
    } finally {
      setProcessing(false);
    }
  }

  const requestedCount = requests.filter((r) => r.status === "REQUESTED").length;

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "ALL", label: `All (${requests.length})` },
              { id: "REQUESTED", label: `Requested (${requestedCount})` },
              { id: "APPROVED", label: "Approved" },
              { id: "REJECTED", label: "Rejected" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === t.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/60 text-muted hover:bg-muted hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by creator or code..."
            className="w-full rounded-md border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {!isSuperAdmin && requestedCount > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted">
          <Clock className="size-4 shrink-0 text-muted" />
          <span>
            There {requestedCount === 1 ? "is" : "are"} <strong>{requestedCount}</strong> pending payout request{requestedCount === 1 ? "" : "s"}. Payout approval and rejection requires Super Administrator privileges.
          </span>
        </div>
      )}

      {/* Requests Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[0.68rem] uppercase tracking-wider text-muted font-semibold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Collaborator</th>
              <th className="py-3 px-4">Referral Code</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted">
                  No redemption requests found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const isPending = r.status === "REQUESTED";

                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-muted whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{r.collaborator.name}</p>
                      {r.collaborator.user?.email && (
                        <p className="text-[0.7rem] text-muted font-mono">{r.collaborator.user.email}</p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {r.collaborator.referralCode ? (
                        <span className="font-mono font-medium text-primary">
                          {r.collaborator.referralCode}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-foreground text-sm">
                      {inrPaise(r.amountPaise)}
                    </td>

                    <td className="py-3 px-4">
                      {r.status === "APPROVED" && <Badge tone="good">Approved</Badge>}
                      {r.status === "REJECTED" && <Badge tone="critical">Rejected</Badge>}
                      {r.status === "REQUESTED" && <Badge tone="warning">Requested</Badge>}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-muted text-[0.75rem]">
                      {r.note || "—"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isPending ? (
                        isSuperAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[0.7rem] px-2.5 py-1 h-auto"
                              onClick={() => openActionModal(r, "approve")}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="text-[0.7rem] px-2.5 py-1 h-auto"
                              onClick={() => openActionModal(r, "reject")}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[0.7rem] text-muted font-normal">Awaiting Super Admin</span>
                        )
                      ) : (
                        <span className="text-[0.7rem] text-muted capitalize">{r.status.toLowerCase()}</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {selectedReq.action === "approve" ? "Approve Payout" : "Reject Payout"}
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  {selectedReq.action === "approve"
                    ? `Mark payout of ${inrPaise(selectedReq.request.amountPaise)} for ${selectedReq.request.collaborator.name} as paid/approved.`
                    : `Decline payout of ${inrPaise(selectedReq.request.amountPaise)} for ${selectedReq.request.collaborator.name}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="rounded-md p-1 text-muted hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {actionError && (
              <div className="mt-4 flex items-center gap-2 rounded-md border border-critical/30 bg-critical/10 p-3 text-xs text-critical">
                <AlertCircle className="size-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  selectedReq.action === "approve"
                    ? "e.g., Bank transfer reference #IMPS8291..."
                    : "e.g., Bank account details unverified, please update..."
                }
                rows={3}
                maxLength={500}
                className="w-full rounded-md border border-border bg-muted/40 p-2.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReq(null)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant={selectedReq.action === "approve" ? "primary" : "danger"}
                onClick={handleConfirmAction}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="size-3.5 animate-spin mr-1" />
                ) : selectedReq.action === "approve" ? (
                  <Check className="size-3.5 mr-1" />
                ) : (
                  <XCircle className="size-3.5 mr-1" />
                )}
                {selectedReq.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
