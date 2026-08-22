import { ExternalLink } from 'lucide-react';
import { formatDate } from '../lib/api.js';

export default function TrustNotice({ sourceName, sourceUrl, lastUpdated, label }) {
  return (
    <div className="trust-strip flex flex-wrap items-center justify-between gap-2">
      <span>
        Source: {sourceName || 'Listed source'} · Last verified: {formatDate(lastUpdated)} · {label || 'Verify on official source before applying.'}
      </span>
      {sourceUrl && (
        <a className="inline-flex items-center gap-1 underline" href={sourceUrl} target="_blank" rel="noreferrer">
          Official source <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}
