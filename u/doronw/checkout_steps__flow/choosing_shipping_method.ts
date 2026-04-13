import * as wmill from "windmill-client";

/**
 * @param {string} publishableKey - Your Medusa Publishable Key (pk_...)
 */
export async function main(publishable_key) {
  const BASE_URL = "https://migrationtest-youleap-rms.youleap.com/store";
  
  // 1. Retrieve the Cart ID from Windmill memory (saved in the previous step)
  const cartId = await wmill.getFlowUserState("created_cart_id") as string;

  if (!cartId) {
    throw new Error("No 'created_cart_id' found in memory. Ensure the Cart Creation step ran successfully.");
  }

  try {
    // 2. Fetch available shipping options for this cart
    // This tells Medusa to show options valid for the cart's region and items.
    const optionsResponse = await fetch(`${BASE_URL}/shipping-options?cart_id=${cartId}`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": publishable_key
      }
    });

    const optionsResult = await optionsResponse.json();

    if (!optionsResponse.ok || !optionsResult.shipping_options?.length) {
      console.error("Failed to fetch shipping options:", optionsResult);
      throw new Error("No shipping options available for this cart/region.");
    }

    // 3. Select the first available option ID
    const selectedOptionId = optionsResult.shipping_options[0].id;
    console.log(`Selected Shipping Option: ${selectedOptionId}`);

    // 4. POST the selected option to the cart
    const addMethodResponse = await fetch(`${BASE_URL}/carts/${cartId}/shipping-methods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishable_key
      },
      body: JSON.stringify({
        option_id: selectedOptionId
      })
    });

    const finalResult = await addMethodResponse.json();

    if (!addMethodResponse.ok) {
      console.error("Failed to add shipping method:", finalResult);
      throw new Error(`Medusa Error: ${finalResult.message || "Could not add shipping method"}`);
    }

    // 5. Save the selected option ID to memory just in case
    await wmill.setFlowUserState("selected_shipping_option_id", selectedOptionId);

    console.log("✅ Shipping method added successfully!");
    
    return {
      success: true,
      cart_id: cartId,
      shipping_option_id: selectedOptionId,
      cart: finalResult.cart
    };

  } catch (error) {
    console.error("Shipping Method Error:", error);
    throw error;
  }
}
