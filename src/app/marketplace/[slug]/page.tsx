import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/data/products";
import { ProductDetailClient } from "@/components/marketplace/ProductDetailClient";
import { getOptimizedOgImageUrl } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return { title: "Produk Tidak Ditemukan — Kodeva" };
  }

  const rawImage =
    product.screenshots[0]?.url ||
    "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&h=420&q=65";
  const primaryImage = getOptimizedOgImageUrl(rawImage);

  return {
    title: `${product.name} — Promo Lisensi Software Kodeva`,
    description: `${product.tagline} ${product.description}`,
    keywords: [
      product.name,
      product.category,
      "aplikasi kasir",
      "aplikasi HR",
      "software bisnis umkm",
      "promo lisensi kodeva",
    ],
    openGraph: {
      title: `${product.name} — Promo Lisensi Kodeva`,
      description: `${product.tagline} Amankan promo diskon lisensi resmi dan kuota terbatas.`,
      url: `/marketplace/${product.slug}`,
      siteName: "Kodeva",
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 420,
          alt: product.name,
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — Promo Lisensi Kodeva`,
      description: product.tagline,
      images: [primaryImage],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
