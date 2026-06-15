"use client";

import {
  PRODUCT_CATEGORIES,
  type DbCategory,
} from "@/lib/product-categories";

type Props = {
  value: DbCategory[];
  onChange: (categories: DbCategory[]) => void;
};

export function ProductCategoryPicker({ value, onChange }: Props) {
  const toggle = (category: DbCategory) => {
    onChange(
      value.includes(category)
        ? value.filter((item) => item !== category)
        : [...value, category]
    );
  };

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {PRODUCT_CATEGORIES.map(({ value: categoryValue, label }) => (
        <label
          key={categoryValue}
          className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
        >
          <input
            type="checkbox"
            checked={value.includes(categoryValue)}
            onChange={() => toggle(categoryValue)}
            className="rounded border-zinc-300"
          />
          {label}
        </label>
      ))}
    </div>
  );
}
