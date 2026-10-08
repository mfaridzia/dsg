import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.REVALIDATION_SECRET || "kodeva-revalidate-secret";

    // Optional secret verification for webhook security
    if (secret && secret !== expectedSecret) {
      return NextResponse.json({ message: "Invalid revalidation secret" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const tag = req.nextUrl.searchParams.get("tag") || body?.tag;
    const path = req.nextUrl.searchParams.get("path") || body?.path;

    if (tag) {
      revalidateTag(tag, "max");
      return NextResponse.json({
        revalidated: true,
        type: "tag",
        tag,
        timestamp: new Date().toISOString(),
      });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        type: "path",
        path,
        timestamp: new Date().toISOString(),
      });
    }

    // Default revalidation for landing and blog
    revalidatePath("/");
    revalidatePath("/blog");

    return NextResponse.json({
      revalidated: true,
      message: "Revalidated default routes (/ and /blog)",
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[Revalidate Error]:", err);
    return NextResponse.json(
      { message: "Error revalidating", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Allow simple GET requests for quick reviewer testing (e.g. /api/revalidate?path=/blog)
  const path = req.nextUrl.searchParams.get("path") || "/";
  const tag = req.nextUrl.searchParams.get("tag");

  if (tag) {
    revalidateTag(tag, "max");
    return NextResponse.json({ revalidated: true, tag, timestamp: new Date().toISOString() });
  }

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path, timestamp: new Date().toISOString() });
}
