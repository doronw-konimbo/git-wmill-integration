export async function main(
  pipedrive_token: string,
  deal_id?: string,
  pm?: string,
  contact?: string,
  phone_number?: string,
  cause?: string
) {
  if (deal_id) {
    // --- Pipedrive path ---
    const response = await fetch(
      `https://api.pipedrive.com/api/v2/deals/${deal_id}`,
      {
        method: 'GET',
        headers: {
          'x-api-token': pipedrive_token,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Pipedrive API error ${response.status}: ${errorDetails}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Pipedrive returned success=false: ${JSON.stringify(data)}`);
    }

    console.log(`Pipedrive path — deal fetched: ${deal_id}`);

    return {
      source: 'pipedrive',
      deal_id,
      deal: data.data,
    };
  } else {
    // --- Manual path ---
    console.log('Manual path — using fields provided in flow input');

    return {
      source: 'manual',
      deal_id: null,
      deal: { pm, contact, phone_number, cause },
    };
  }
}
