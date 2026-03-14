"use client";

import { useEffect, useState } from "react";
import type { Release } from "@/lib/music";
import ReleaseCard from "./ReleaseCard";
import ReleaseSkeleton from "./ReleaseSkeleton";
import BandcampPlayer from "./BandcampPlayer";

const SKELETON_COUNT = 8;

function groupByYear(releases: Release[]): [number, Release[]][] {
  const map = new Map<number, Release[]>();
  for (const r of releases) {
    const year = r.releaseDate
      ? new Date(r.releaseDate).getFullYear()
      : 0;
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(r);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

export default function DiscographyBrowser() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);

  useEffect(() => {
    fetch("/api/music")
      .then((res) => res.json())
      .then((data: Release[]) => {
        setReleases(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  function handleCardClick(release: Release) {
    setSelectedRelease(
      selectedRelease?.id === release.id ? null : release
    );
  }

  if (loading) {
    return (
      <div>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ReleaseSkeleton key={i} />
        ))}
      </div>
    );
  }

  const groups = groupByYear(releases);

  return (
    <div className="space-y-8">
      {groups.map(([year, yearReleases]) => (
        <section key={year}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-(--color-text-secondary) mb-1 px-4">
            {year || "Unknown"}
          </h2>
          <div className="divide-y divide-(--color-border)">
            {yearReleases.map((release) => (
              <div key={release.id}>
                <ReleaseCard
                  release={release}
                  isSelected={selectedRelease?.id === release.id}
                  onClick={() => handleCardClick(release)}
                />
                {selectedRelease?.id === release.id && (
                  <BandcampPlayer
                    release={selectedRelease}
                    onClose={() => setSelectedRelease(null)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
