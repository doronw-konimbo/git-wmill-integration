import * as wmill from "windmill-client";

/**
 * @param {string} cartId - The Cart ID from flow state
 * @param {string} publishableKey - Medusa Publishable Key (pk_...)
 */
export async function main(publishable_key) {
  const cartId = await wmill.getFlowUserState("created_cart_id") as string;
  const URL = `https://migrationtest-youleap-rms.youleap.com/store/carts/${cartId}/complete`;
  const publishableKey = process.env.MEDUSA_PUBLIC_KEY 
      || await wmill.getVariable("u/doronw/MEDUSA_PUBLIC_KEY");
  
  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishable_key,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      // Throwing the stringified result ensures you see the Medusa error details
      throw new Error(`Completion Failed: ${JSON.stringify(result)}`);
    }

    return result;
  } catch (error: any) {
    // Re-throwing the error allows Windmill to mark the step as failed
    throw new Error(error.message || JSON.stringify(error));
  }
}