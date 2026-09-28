"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PopupItem {
  id: string;
  imageUrl: string;
  route: string;
  title?: string | null;
}

const SEEN_KEY = "oams_popup_seen";

export default function DashboardPopup() {
  const router = useRouter();
  const [items, setItems] = useState<PopupItem[]>([]);
  const [index, setIndex] = useState(0);
  const [closed, setClosed] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // ignore
    }
    if (seen) return;
    (async () => {
      try {
        const res = await fetch("/api/dashboards");
        if (res.ok) {
          const data = await res.json();
          if ((data.dashboards ?? []).length > 0) {
            setItems(data.dashboards);
            setClosed(false);
            try {
              sessionStorage.setItem(SEEN_KEY, "1");
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  if (closed || items.length === 0) return null;
  const current = items[index];

  function openRoute(r: PopupItem) {
    setClosed(true);
    router.push(r.route);
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
        <button
          onClick={() => setClosed(true)}
          aria-label="Close"
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full w-9 h-9 text-xl leading-none"
        >
          ×
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.imageUrl}
          alt={current.title ?? "featured"}
          onClick={() => openRoute(current)}
          className="w-full max-h-[80vh] object-contain cursor-pointer"
        />
        {items.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/60"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}