import * as wmill from "windmill-client";

export async function main(publishable_key:string) {
  const MEDUSA_URL = "https://migrationtest-youleap-rms.youleap.com/store/products";

  try {
    const response = await fetch(MEDUSA_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json",
                  "x-publishable-api-key": publishable_key}
    });

    if (!response.ok) {
      throw new Error(`Medusa API Error: ${response.status}`);
    }

    const data = await response.json();

    // --- DEBUGGING LOGS ---
    // This will print the entire raw response to the Windmill execution logs
    console.log("RAW MEDUSA DATA:", JSON.stringify(data, null, 2));
    
    // Log specifically how many products were found
    console.log(`Found ${data.products?.length || 0} products.`);
    // ----------------------

    // Transform the data
    const simplifiedProducts = data.products.map(product => ({
      id: product.id,
      title: product.title,
      variants: product.variants.map(v => ({
        sku: v.sku,
        variant_id: v.id,
      }))
    }));

    // Save the JSON array to Windmill Flow State
    console.log(simplifiedProducts)
    await wmill.setFlowUserState("processed_products", simplifiedProducts);

    return {
      success: true,
      count: simplifiedProducts.length
    };

  } catch (error) {
    console.error("Script failed:", error);
    throw error;
  }
}
