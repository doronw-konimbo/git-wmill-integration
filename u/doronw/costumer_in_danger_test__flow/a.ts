export async function main(deal_id: string, pipedrive_token: string) {
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

  console.log(`Deal fetched successfully: ${deal_id}`);

  return {
    deal_id,
    deal: data.data,
  };
}
