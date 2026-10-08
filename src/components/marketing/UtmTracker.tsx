"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUtmStore } from "@/lib/store/utmStore";

function UtmCaptureWorker() {
  const searchParams = useSearchParams();
  const captureFromUrl = useUtmStore((state) => state.captureFromUrl);

  useEffect(() => {
    if (searchParams) {
      captureFromUrl(searchParams);
    }
  }, [searchParams, captureFromUrl]);

  return null;
}

export function UtmTracker() {
  return (
    <Suspense fallback={null}>
      <UtmCaptureWorker />
    </Suspense>
  );
}
