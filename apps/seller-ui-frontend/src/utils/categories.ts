// types.ts
export interface CategoryOptionType {
  value: string;
  label: string;
}

export const CATEGORIES: CategoryOptionType[] = [
  { value: "clothing", label: "Clothing & Apparel" },
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "grocery", label: "Grocery & Supermarkets" },
  { value: "restaurant", label: "Restaurants & Cafés" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "furniture", label: "Furniture & Home Decor" },
  { value: "automotive", label: "Automotive & Accessories" },
  { value: "books", label: "Books & Stationery" },
  { value: "toys", label: "Toys & Games" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "hardware", label: "Hardware & Tools" },
  { value: "pet", label: "Pet Supplies & Services" },
  { value: "medical", label: "Medical & Pharmacy" },
  { value: "jewelry", label: "Jewelry & Watches" },
  { value: "florist", label: "Florists & Gift Shops" },
  { value: "baby", label: "Baby & Kids Store" },
  { value: "art", label: "Art & Craft Supplies" },
  { value: "music", label: "Music Instruments & Stores" },
];

export type CategoryOption = (typeof CATEGORIES)[number];
export type CategoryValue = CategoryOption["value"];
