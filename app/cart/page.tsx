import React from 'react';
import { getProducts, getReviews } from "@/lib/api/server";
import { CartClient } from "./CartClient";

export default async function CartPage() {
  const [products, reviews] = await Promise.all([
    getProducts(),
    getReviews()
  ]);

  return <CartClient products={products} reviews={reviews} />;
}
