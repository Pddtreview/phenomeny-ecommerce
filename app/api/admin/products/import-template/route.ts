import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

const HEADERS = [
  "name",
  "slug",
  "category",
  "description",
  "hsn_code",
  "weight_grams",
  "is_active",
  "variant_name",
  "sku",
  "price",
  "compare_price",
  "cost_price",
  "stock_quantity",
  "image_urls",
  "meta_title",
  "meta_description",
  "length_cm",
  "breadth_cm",
  "height_cm",
];

const EXAMPLE_ROW = {
  name: "Pyrite Wealth Frame",
  slug: "pyrite-wealth-frame",
  category: "frames",
  description: "A powerful pyrite frame...",
  hsn_code: "7323",
  weight_grams: "450",
  is_active: "TRUE",
  variant_name: "Standard 6x8 inch",
  sku: "NV-PF-001",
  price: "1299",
  compare_price: "1599",
  cost_price: "260",
  stock_quantity: "50",
  image_urls:
    "https://res.cloudinary.com/example/image1.jpg,https://res.cloudinary.com/example/image2.jpg",
  meta_title: "Pyrite Wealth Frame",
  meta_description: "Attract wealth and abundance...",
  length_cm: "20",
  breadth_cm: "15",
  height_cm: "3",
};

export async function GET() {
  const ws = XLSX.utils.aoa_to_sheet([
    HEADERS,
    HEADERS.map((h) => (EXAMPLE_ROW as Record<string, string>)[h] ?? ""),
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        "attachment; filename=nauvarah-products-template.xlsx",
    },
  });
}
