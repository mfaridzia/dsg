import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UtmParameters } from "@/types/marketing";

export type UtmStore = {
  utm: UtmParameters;
  capturedAt: string | null;
  captureFromUrl: (searchParams: URLSearchParams) => boolean;
  clearUtm: () => void;
  getUtmPayload: () => UtmParameters;
};

export const useUtmStore = create<UtmStore>()(
  persist(
    (set, get) => ({
      utm: {},
      capturedAt: null,

      captureFromUrl: (searchParams: URLSearchParams) => {
        const source =
          searchParams.get("utm_source") ||
          searchParams.get("source") ||
          searchParams.get("ref");
        const medium =
          searchParams.get("utm_medium") ||
          searchParams.get("medium");
        const campaign =
          searchParams.get("utm_campaign") ||
          searchParams.get("campaign");
        const content =
          searchParams.get("utm_content") ||
          searchParams.get("content");
        const term =
          searchParams.get("utm_term") ||
          searchParams.get("term");

        // If at least one UTM parameter is present, record it
        if (source || medium || campaign || content || term) {
          const newUtm: UtmParameters = {
            utm_source: source || get().utm.utm_source || undefined,
            utm_medium: medium || get().utm.utm_medium || undefined,
            utm_campaign: campaign || get().utm.utm_campaign || undefined,
            utm_content: content || get().utm.utm_content || undefined,
            utm_term: term || get().utm.utm_term || undefined,
          };

          set({
            utm: newUtm,
            capturedAt: get().capturedAt || new Date().toISOString(),
          });
          return true;
        }

        return false;
      },

      clearUtm: () => {
        set({ utm: {}, capturedAt: null });
      },

      getUtmPayload: () => {
        return get().utm;
      },
    }),
    {
      name: "kodeva-utm-attribution",
      skipHydration: true,
    }
  )
);
