import { UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import type { Collaborator } from "@/lib/api/types";

export default function Collabs({ collaborators }: { collaborators: Collaborator[] }) {
  return (
    <section className="bg-cream-50">
      <div className="container-vel grid gap-10 pt-0 pb-14 lg:grid-cols-[1.6fr_1fr] lg:items-center">
        <div>
          <div className="mb-8 text-center">
            <h2 className="font-display text-[1.75rem] font-semibold tracking-[0.03em] uppercase text-plum-800">
              COLLABORATIONS
            </h2>
            <p className="mt-1 text-sm font-medium text-ink-soft">
              Partnering with amazing creators and beauty experts.
            </p>
          </div>

          <div className="relative flex items-center gap-2 lg:gap-4">
            <button className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-200/60 bg-white text-gold-600 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-colors hover:border-gold-400">
              <ChevronLeft className="size-5" />
            </button>

            <ul className="flex flex-1 snap-x snap-mandatory items-start justify-between gap-4 overflow-x-auto no-scrollbar">
              {collaborators.map((c) => (
                <li key={c.id} className="flex min-w-[5.5rem] snap-start flex-col items-center text-center">
                  <Avatar
                    src={c.avatarUrl}
                    name={c.name}
                    size={85}
                  />
                  <p className="mt-3.5 text-[0.78rem] font-bold text-plum-800 leading-tight">{c.name}</p>
                  <p className="mt-1 text-[0.68rem] font-medium text-ink-soft leading-tight">{c.role}</p>
                </li>
              ))}
            </ul>

            <button className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-200/60 bg-white text-gold-600 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-colors hover:border-gold-400">
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="rounded-[16px] border border-gold-200/50 bg-[#FCFAF8] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] lg:ml-8">
          <div className="flex items-center gap-3">
            <UserPlus className="size-9 text-gold-500" strokeWidth={1.5} />
            <h3 className="font-display text-[1.4rem] font-medium uppercase tracking-widest text-plum-800">
              Be a Part of Velastia
            </h3>
          </div>
          <p className="mt-5 text-[0.95rem] font-medium leading-[1.6] text-ink-soft">
            Are you a creator or makeup artist?<br />
            Let&apos;s collaborate and create magic together.
          </p>
          <Button href="/collabs" className="mt-7 px-8 py-3.5 text-[0.8rem] rounded-[6px] uppercase tracking-widest font-semibold">
            Apply for Collab
          </Button>
        </div>
      </div>
    </section>
  );
}
