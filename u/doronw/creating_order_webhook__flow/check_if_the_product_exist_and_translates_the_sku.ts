import * as wmill from "windmill-client";

/**
 * @param {string[]} targetSkus - An array of SKUs to check (e.g. ["SHIRT-S", "HAT-01"])
 */
export async function main(email, shipping_address, order: any[]) {
  // 1. Retrieve the JSON array saved in the previous step
  const products = await wmill.getFlowUserState("processed_products");

  if (!products || !Array.isArray(products)) {
    throw new Error("No processed products found in flow state. Did the previous step run?");
  }

  const results: any = {
    found: [],
    missing: [],
    translatedData: {}
  };

  // 2. Loop through each SKU in your input array
  for (const orderProduct of order) {
    let matchFound = false;

    // 3. Search through the saved Medusa products
    for (let product of products) {
      let variantMatch = product.variants.find(v => v.sku === orderProduct.sku);
      if (variantMatch) {
        console.log(variantMatch)
        results.found.push({
          "variant_id": variantMatch.variant_id,
          "quantity": orderProduct.quantity
        });
        matchFound = true;
        break; // Found the SKU, move to the next SKU in targetSkus
      }
    }

    if (!matchFound) {
      results.missing.push(orderProduct);
    }
  }

  // 4. Log a summary for debugging
  await wmill.setFlowUserState("products_sku_variant_translated", 
                                {email: email, 
                                 shipping_address: shipping_address,
                                items: results.found});
  console.log(`Search complete. Found: ${results.found.length}, Missing: ${results.missing.length}`);
  results.translatedData = await wmill.getFlowUserState("products_sku_variant_translated");
  return results;
}