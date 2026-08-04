'use client';

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, SprayCan } from "lucide-react";
import { generateWallSVG, getWallLevel, getWallPalette } from "@/lib/skins/wallGenerator";

interface GraffitiWallProps {
  userId: string;
  name: string;
  totalCheckins: number;
  workoutTypes?: string[];
  stickers?: number;
  streak?: number;
  className?: string;
}

/**
 * The user's procedural graffiti wall. Purely derived from profile stats —
 * same user + same stats always paints the same wall (see wallGenerator.ts).
 */
export function GraffitiWall({
  userId,
  name,
  totalCheckins,
  workoutTypes = [],
  stickers = 0,
  streak = 0,
  className,
}: GraffitiWallProps) {
  const svg = useMemo(
    () => generateWallSVG({ userId, name, totalCheckins, workoutTypes, stickers, streak }),
    // workoutTypes/stickers are derived from queries — key on stable primitives
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, name, totalCheckins, workoutTypes.length, stickers, streak]
  );

  const wallLevel = getWallLevel(totalCheckins);
  const accent = getWallPalette(workoutTypes)[0];

  const downloadWall = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fittribe-wall-lv${wallLevel.level}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={className}>
      <div
        className="rounded-2xl overflow-hidden border shadow-sm [&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
        // Safe: SVG is generated locally and all user text is XML-escaped
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        <div className="flex items-center gap-2 text-sm">
          <SprayCan className="w-4 h-4" style={{ color: accent }} />
          <span className="font-semibold">
            Level {wallLevel.level} · {wallLevel.name}
          </span>
          {wallLevel.next && (
            <span className="text-muted-foreground">
              — {wallLevel.next.remaining} check-in{wallLevel.next.remaining === 1 ? "" : "s"} to {wallLevel.next.name}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={downloadWall} className="gap-2">
          <Download className="w-3.5 h-3.5" />
          Download wall
        </Button>
      </div>
    </div>
  );
}
