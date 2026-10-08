"use client";

import { useState } from "react";
import { LandingContent } from "@/lib/data/cmsContent";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQSectionProps {
  faqs: LandingContent["faqs"];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq-section" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pertanyaan yang Sering Diajukan</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Semua yang Perlu Anda Ketahui Tentang Kodeva
          </h2>
          <p className="text-sm text-slate-600">
            Punya pertanyaan seputar implementasi kasir, keamanan data, atau promo lisensi?
            Temukan jawabannya di sini.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-all ${
                  isOpen
                    ? "border-indigo-300 bg-indigo-50/20 shadow-xs"
                    : "border-slate-200 bg-slate-50/40 hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm sm:text-base"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${
                      isOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-indigo-100/60 mt-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
