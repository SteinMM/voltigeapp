"use client";

import { Partner } from "@/lib/types";

interface Props {
  partner: Partner;
}

export function PartnerCard({ partner }: Props) {
  return (
    <a
      href={partner.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-md active:scale-[0.98] transition-all"
    >
      {/* Logo */}
      <div className="flex-none w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
        {partner.logoUrl ? (
          <img
            src={partner.logoUrl}
            alt={partner.name}
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              const parent = el.parentElement;
              if (parent) {
                parent.innerHTML = `<span class="text-lg font-bold text-gray-400">${partner.name[0]}</span>`;
              }
            }}
          />
        ) : (
          <span className="text-lg font-bold text-gray-400">{partner.name[0]}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-gray-900 truncate">
                {partner.name}
              </h3>
              {partner.featured && (
                <span className="flex-none text-yellow-500">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
              {partner.description}
            </p>
          </div>
          {/* Arrow */}
          <svg
            className="flex-none w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Chips: categorieën + commissie */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {partner.categories.map((cat) => (
            <span
              key={cat}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700"
            >
              {cat}
            </span>
          ))}
          {partner.commission && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              💰 {partner.commission}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
