import { createServerFn } from "@tanstack/react-start";

export interface FoodHit {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  /** Per 100 g / 100 ml. */
  per100: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
  servingLabel: string | null;
  servingGrams: number | null;
}

const UA = "SEVEN3SEVEN/1.0 (nutrition logging)";
const FIELDS =
  "code,product_name,brands,serving_size,serving_quantity,nutriments";

const num = (v: unknown) => {
  const n = typeof v === "string" ? Number.parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : 0;
};

type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number | string;
  nutriments?: Record<string, unknown>;
};

function normalise(p: OffProduct): FoodHit | null {
  const name = (p.product_name ?? "").trim();
  if (!name) return null;
  const n = p.nutriments ?? {};
  const kcal = num(n["energy-kcal_100g"]) || num(n["energy_100g"]) / 4.184;
  const per100 = {
    calories: Math.round(kcal),
    protein_g: Math.round(num(n["proteins_100g"]) * 10) / 10,
    carbs_g: Math.round(num(n["carbohydrates_100g"]) * 10) / 10,
    fat_g: Math.round(num(n["fat_100g"]) * 10) / 10,
  };
  if (per100.calories === 0 && per100.protein_g === 0 && per100.carbs_g === 0 && per100.fat_g === 0) return null;
  const servingGrams = num(p.serving_quantity) || null;
  return {
    id: p.code ?? name,
    name,
    brand: (p.brands ?? "").split(",")[0]?.trim() || null,
    barcode: p.code ?? null,
    per100,
    servingLabel: p.serving_size?.trim() || null,
    servingGrams,
  };
}

/** Text search against Open Food Facts. */
export const searchFoods = createServerFn({ method: "GET" })
  .inputValidator((data: { query: string }) => ({ query: String(data.query ?? "").slice(0, 80) }))
  .handler(async ({ data }): Promise<{ items: FoodHit[]; error?: string }> => {
    const q = data.query.trim();
    if (q.length < 2) return { items: [] };
    const url =
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}` +
      `&search_simple=1&action=process&json=1&page_size=24&fields=${FIELDS}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) return { items: [], error: "Food search unavailable" };
      const body = (await res.json()) as { products?: OffProduct[] };
      const items = (body.products ?? []).map(normalise).filter((x): x is FoodHit => !!x).slice(0, 20);
      return { items };
    } catch {
      return { items: [], error: "Food search unavailable" };
    }
  });

/** Barcode lookup against Open Food Facts. */
export const lookupBarcode = createServerFn({ method: "GET" })
  .inputValidator((data: { barcode: string }) => ({
    barcode: String(data.barcode ?? "").replace(/\D/g, "").slice(0, 14),
  }))
  .handler(async ({ data }): Promise<{ item: FoodHit | null; error?: string }> => {
    if (!data.barcode) return { item: null, error: "Invalid barcode" };
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${data.barcode}.json?fields=${FIELDS}`,
        { headers: { "User-Agent": UA } },
      );
      if (!res.ok) return { item: null, error: "Product not found" };
      const body = (await res.json()) as { status?: number; product?: OffProduct };
      if (!body.product) return { item: null, error: "Product not found" };
      const item = normalise(body.product);
      return item ? { item } : { item: null, error: "No nutrition data for that product" };
    } catch {
      return { item: null, error: "Lookup unavailable" };
    }
  });