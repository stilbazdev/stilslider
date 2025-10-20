// app/api/projects/route.ts
import { context } from "@react-three/fiber";
import { NextResponse } from "next/server";

const WP_API_BASE = process.env.WP_API_BASE || "http://localhost/ruzgar/wp-json/wp/v2";
const WP_PORTFOLIO_ENDPOINT = `${WP_API_BASE}/portfolio`;

export async function GET() {
    try {
        const res = await fetch(WP_PORTFOLIO_ENDPOINT, {
            cache: "no-store", // geliştirme: her istekte taze veri al. Prod için next: { revalidate: 60 } düşünülebilir.
        });

        if (!res.ok) {
            console.error("WP portfolio fetch failed", res.status);
            return NextResponse.json({ error: "Portfolio verisi alınamadı" }, { status: 502 });
        }

        const data = await res.json();

        // Map: WP objesini slider’ın beklediği sade formata çevir
        const projects = (data || []).map((item: any, index: number) => ({
            id: item.id,
            title: item.title?.rendered ?? "",
            description:
                item.meta?.["portfolio_options_item-short-description"]?.[0] ??
                item.excerpt?.rendered ??
                "",
            slug: item.slug,
            image:
                item.meta?.["portfolio_options_upload-portfolio-bg-image"]?.[0]
                    ?.replace("http://localhost/ruzgar/wp-content/uploads", "/uploads") || null,
            color: item.meta?.["portfolio_options_item-color"]?.[0] ?? "rgb(245,248,255)",
            bgColor: item.meta?.["portfolio_options_item-bg-color"]?.[0] ?? "#ffffff",
            textcolor: item.meta?.["portfolio_options_item-text-color"]?.[0] ?? "#ffffff",
            number: item.meta?.["portfolio_options_item-number"]?.[0] ?? null,

            // 🎥 Yeni video alanı:
            video:
                item.meta?.["portfolio_options_upload-portfolio-video"]?.[0]
                    ?.replace("http://localhost/ruzgar/wp-content/uploads", "/uploads") || null,

            raw: item,
            content: item.content?.rendered,
        }));



        return NextResponse.json(projects);
    } catch (err) {
        console.error("API /api/projects error:", err);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
