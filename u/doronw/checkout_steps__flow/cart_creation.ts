import * as wmill from "windmill-client";

/**
 * @param {string} regionId - Medusa Region ID (e.g., "reg_01...")
 * @param {string} publishableKey - Your Medusa Publishable Key (pk_...)
 * @param {string} email - Optional customer email
 */
export async function main(
  regionId: string,
  translatedData: any,
  publishable_key: string
) {
  const BASE_URL = "https://migrationtest-youleap-rms.youleap.com/store";

  // 1. Retrieve translated variants from memory
  console.log("Retrieved translated data:", translatedData);


  let cartId: string;

  // --- TRY BLOCK 1: Create the Cart ---
  try {
    const cartResponse = await fetch(`${BASE_URL}/carts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishable_key,
      },
      body: JSON.stringify({
        region_id: regionId,
        email: translatedData.translatedData.email,
        shipping_addres: translatedData.translatedData.shipping_addres
      }),
    });

    const result = await cartResponse.json();

    if (!cartResponse.ok) {
      throw new Error(`Medusa Cart Error ${cartResponse.status}: ${result.message || "Unknown Error"}`);
    }

    cartId = result.cart.id;
    await wmill.setFlowUserState("created_cart_id", cartId);
    console.log(`✅ Cart created and ID saved: ${cartId}`);
  } catch (error: any) {
    console.error("Critical Failure creating cart:", error.message);
    throw error; // Stop the flow if we can't even create a cart
  }

  const results = {
    added: [] as string[],
    failed: [] as any[],
  };

  // --- TRY BLOCK 2: Loop through items ---
  // We use a separate block so one failed item doesn't crash the whole script
  for (const item of translatedData.translatedData.items) {
    try {
      console.log(`Adding variant: ${item.variant_id} (Qty: ${item.quantity})`);

      const response = await fetch(`${BASE_URL}/carts/${cartId}/line-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishable_key,
        },
        body: JSON.stringify({
          variant_id: item.variant_id,
          quantity: item.quantity || 1,
        }),
      });

      const itemResult = await response.json();

      if (!response.ok) {
        console.error(`Failed to add ${item.variant_id}:`, itemResult.message);
        results.failed.push({ variant_id: item.variant_id, error: itemResult.message });
      } else {
        results.added.push(item.variant_id);
      }
    } catch (error: any) {
      console.error(`Network/System error adding ${item.variant_id}:`, error.message);
      results.failed.push({ variant_id: item.variant_id, error: error.message });
    }
  }

  return {
    cart_id: cartId,
    summary: results,
    success_count: results.added.length,
    failure_count: results.failed.length,
  };
}