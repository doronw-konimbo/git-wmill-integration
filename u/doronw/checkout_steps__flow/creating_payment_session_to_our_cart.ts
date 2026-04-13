import * as wmill from "windmill-client";

/**
 * @param {string} publishableKey - Your Medusa Publishable Key (pk_...)
 * @param {string} providerId - The payment provider ID (e.g., "pp_stripe_stripe" or "manual")
 */
export async function main(
  publishableKey: string,
  providerId: string = "pp_system_default"
) {
  const BASE_URL = "https://migrationtest-youleap-rms.youleap.com/store";
  
  // 1. Retrieve the Cart ID from memory
  const cartId = await wmill.getFlowUserState("created_cart_id") as string;

  if (!cartId) {
    throw new Error("No 'created_cart_id' found in memory. Cart must be created first.");
  }

  try {
    // 2. Step 1: Create Payment Collection
    // This groups the payment intent for the specific cart.
    const collectionResponse = await fetch(`${BASE_URL}/payment-collections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey
      },
      body: JSON.stringify({
        cart_id: cartId
      })
    });
    
    const collectionResult = await collectionResponse.json();
    console.log(collectionResponse)
    if (!collectionResponse.ok) {
      console.error("Payment Collection Error:", collectionResult);
      throw new Error(`Status ${collectionResponse.status}: ${collectionResult.message || "Failed to create payment collection"}`);
    }

    const payColId = collectionResult.payment_collection.id;
    
    // Save the Payment Collection ID to memory
    await wmill.setFlowUserState("payment_collection_id", payColId);
    console.log(`✅ Payment Collection created: ${payColId}`);

    // 3. Step 2: Create Payment Session
    // This initializes the specific provider (Stripe, etc.) for that collection.
    const sessionResponse = await fetch(`${BASE_URL}/payment-collections/${payColId}/payment-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey
      },
      body: JSON.stringify({
        provider_id: providerId
      })
    });

    const sessionResult = await sessionResponse.json();

    if (!sessionResponse.ok) {
      console.error("Payment Session Error:", sessionResult);
      throw new Error(`Status ${sessionResponse.status}: ${sessionResult.message || "Failed to create payment session"}`);
    }

    console.log(`✅ Payment Session initialized with provider: ${providerId}`);

    return {
      cart_id: cartId,
      payment_collection_id: payColId,
      payment_collection: sessionResult.payment_collection // Returns updated collection with session
    };

  } catch (error) {
    console.error("Payment Flow Execution Failed:", error);
    throw error;
  }
}