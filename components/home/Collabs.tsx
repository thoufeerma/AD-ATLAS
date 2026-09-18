import { Handshake } from "lucide-react";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import type { Collaborator } from "@/lib/api/types";

export default function Collabs({ collaborators }: { collaborators: Collaborator[] }) {
  return (
    <section className="bg-cream-50">
      <div className="container-vel grid gap-10 py-14 lg:grid-cols-[1.6fr_1fr] lg:items-center">
        <div>
          <div className="mb-7 text-center lg:text-left">
            <h2 className="font-display text-2xl tracking-[0.05em] text-plum-800">
              COLLABORATIONS
            </h2>
            <p className="mt-1 text-xs text-ink-soft">
              Partnering with amazing creators and beauty experts.
            </p>
          </div>

          <ul className="grid grid-cols-3 gap-6 sm:grid-cols-5">
            {collaborators.map((c) => (
              <li key={c.id} className="flex flex-col items-center text-center">
                <Avatar
                  src={c.avatarUrl}
                  name={c.name}
                  size={64}
                  className="border border-gold-300/70"
                />
                <p className="mt-2.5 text-[0.72rem] font-medium text-plum-800">{c.name}</p>
                <p className="text-[0.62rem] text-ink-soft">{c.role}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-7">
          <div className="flex items-center gap-2.5">
            <Handshake className="size-6 text-gold-600" />
            <h3 className="label-caps text-[0.72rem] text-plum-800">
              Be a Part of Velastia
            </h3>
          </div>
          <p className="mt-3.5 text-sm leading-relaxed text-ink-soft">
            Are you a creator or makeup artist? Let&apos;s collaborate and create
            magic together.
          </p>
          <Button href="/collabs" className="mt-6">
            Apply for Collab
          </Button>
        </div>
      </div>
    </section>
  );
}
