"use client";

import { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { buildChartData } from "@/lib/discogs";
import type { DiscogsRelease, ChartDataPoint } from "@/lib/discogs";

const CACHE_KEY = "discogs_collection_cache_v2";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CollectionGrowthChartProps {
  releases?: DiscogsRelease[];
  totalCount: number;
  loading?: boolean;
}

function getCachedCollection(): DiscogsRelease[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw) as {
      data: DiscogsRelease[];
      timestamp: number;
    };
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedCollection(data: DiscogsRelease[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // localStorage may be unavailable (SSR, private browsing)
  }
}

export default function CollectionGrowthChart({
  releases: initialReleases,
  totalCount,
  loading: initialLoading,
}: CollectionGrowthChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>(
    initialReleases ? buildChartData(initialReleases) : []
  );
  const [internalLoading, setInternalLoading] = useState(!initialReleases);
  const loading = initialLoading ?? internalLoading;

  useEffect(() => {
    if (initialReleases !== undefined) {
      setChartData(buildChartData(initialReleases));
      setInternalLoading(false);
      return;
    }

    const cached = getCachedCollection();
    if (cached) {
      setChartData(buildChartData(cached));
      setInternalLoading(false);
      return;
    }

    fetch("/api/discogs/collection")
      .then((r) => r.json())
      .then((data: DiscogsRelease[]) => {
        setCachedCollection(data);
        setChartData(buildChartData(data));
      })
      .catch(() => {
        // Leave chart empty on error
      })
      .finally(() => setInternalLoading(false));
  }, [initialReleases]);

  if (loading) {
    return (
      <section aria-labelledby="collection-growth-heading">
        <ChartHeader totalCount={totalCount} />
        <div
          data-testid="chart-skeleton"
          role="status"
          aria-label="Loading chart"
          className="h-72 rounded bg-(--color-border) animate-pulse"
        />
      </section>
    );
  }

  const months = chartData.map((d) => d.month);
  const counts = chartData.map((d) => d.count);

  return (
    <section aria-labelledby="collection-growth-heading">
      <ChartHeader totalCount={totalCount} />
      <div data-testid="collection-chart" className="w-full">
        {chartData.length > 0 ? (
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: months,
                valueFormatter: (month: string) => {
                  const [year, m] = month.split("-");
                  return new Date(
                    Number(year),
                    Number(m) - 1
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                  });
                },
                tickLabelStyle: {
                  angle: months.length > 12 ? -45 : 0,
                  textAnchor: months.length > 12 ? "end" : "middle",
                  fontSize: 11,
                },
              },
            ]}
            yAxis={[{ label: "Records added" }]}
            series={[{ data: counts, label: "Records added", color: "var(--color-accent)" }]}
            height={300}
            margin={{ top: 20, bottom: months.length > 12 ? 60 : 30, left: 50, right: 20 }}
          />
        ) : (
          <p className="text-sm text-(--color-text-secondary) py-8 text-center">
            No collection data available.
          </p>
        )}
      </div>
    </section>
  );
}

function ChartHeader({ totalCount }: { totalCount: number }) {
  return (
    <div className="flex items-baseline gap-2 mb-4">
      <span
        id="collection-growth-heading"
        className="text-3xl font-bold text-(--color-text-primary)"
      >
        {totalCount}
      </span>
      <span className="text-sm text-(--color-text-secondary)">
        records in collection
      </span>
    </div>
  );
}
