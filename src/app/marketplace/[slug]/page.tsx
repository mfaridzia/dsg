import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/data/products";
import { ProductDetailClient } from "@/components/marketplace/ProductDetailClient";

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

  return {
    title: `${product.name} — Promo Lisensi Kodeva`,
    description: product.tagline,
    openGraph: {
      title: product.name,
      description: product.tagline,
      images: [{ url: product.screenshots[0]?.url || "", width: 1200, height: 630 }],
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
