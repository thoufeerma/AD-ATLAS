/**
 * A post's body, written in the admin as plain paragraphs with two small
 * conveniences: a line starting "## " is a heading, and lines starting "- "
 * are a list. Everything else is a paragraph, so nothing a writer types can
 * inject markup.
 */
export default function PostBody({ body }: { body: string }) {
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flush = () => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="ml-5 list-disc space-y-2 text-[0.95rem] leading-relaxed text-ink-soft">
        {bullets.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2).trim());
      continue;
    }
    flush();
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={`h-${blocks.length}`} className="pt-2 font-display text-2xl text-plum-800">
          {line.slice(3).trim()}
        </h2>,
      );
    } else {
      blocks.push(
        <p key={`p-${blocks.length}`} className="text-[0.95rem] leading-relaxed text-ink-soft">
          {line}
        </p>,
      );
    }
  }
  flush();

  return <div className="space-y-5">{blocks}</div>;
}
