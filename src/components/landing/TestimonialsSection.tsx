import Image from "next/image";
import { LandingContent } from "@/lib/data/cmsContent";
import { Star, Quote } from "lucide-react";

interface TestimonialsSectionProps {
  testimonials: LandingContent["testimonials"];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Kisah Sukses Pengguna
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dipercaya Oleh Ribuan Pengusaha Cafe, Retail, & Jasa
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Dengarkan langsung cerita bagaimana para pelaku bisnis menghemat waktu rekap kasir
            dan meningkatkan profit usaha mereka.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testi) => (
            <div
              key={testi.id}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between relative hover:shadow-md transition"
            >
              <Quote className="w-8 h-8 text-indigo-100 absolute top-6 right-6 pointer-events-none" />

              <div className="space-y-4">
                {/* Star rating */}
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: testi.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{testi.quote}&rdquo;
                </p>
              </div>

              {/* Author Details */}
              <div className="flex items-center gap-3.5 pt-6 mt-6 border-t border-slate-100">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  <Image
                    src={testi.avatarUrl}
                    alt={testi.authorName}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{testi.authorName}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {testi.role} — {testi.businessName}
                  </p>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                    {testi.businessType}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
