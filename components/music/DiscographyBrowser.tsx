"use client";

import { useEffect, useState } from "react";
import type { Release } from "@/lib/music";
import ReleaseCard from "./ReleaseCard";
import ReleaseSkeleton from "./ReleaseSkeleton";
import BandcampPlayer from "./BandcampPlayer";

const SKELETON_COUNT = 10;

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

  return (
    <div className={selectedRelease ? "pb-[180px]" : ""}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <ReleaseSkeleton key={i} />
            ))
          : releases.map((release) => (
              <ReleaseCard
                key={release.id}
                release={release}
                isSelected={selectedRelease?.id === release.id}
                onClick={() => setSelectedRelease(release)}
              />
            ))}
      </div>

      {selectedRelease && (
        <BandcampPlayer
          release={selectedRelease}
          onClose={() => setSelectedRelease(null)}
        />
      )}
    </div>
  );
}
