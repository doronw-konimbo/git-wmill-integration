import * as wmill from "windmill-client";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

export async function main(
  airtable_base_id: string,
  customer_name: string,
  opened_by: string
) {
  const config = await wmill.getFlowUserState("airtable_config");

  if (!config) {
    throw new Error(
      "Airtable config missing from flow state. Ensure step A ran successfully."
    );
  }

  const { api_token, pipes_table } = config;

  const body = {
    fields: {
      "Customer Name": customer_name.trim(),
      "Opened By": opened_by.trim(),
      Status: "New",
      "Created At": new Date().toISOString(),
    },
  };

  console.log(`Creating pipe record in table "${pipes_table}"...`);

  const response = await fetch(
    `${AIRTABLE_API_URL}/${airtable_base_id}/${encodeURIComponent(pipes_table)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${api_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Airtable API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const pipe_record_id = data.id;

  await wmill.setFlowUserState("pipe_record_id", pipe_record_id);

  console.log(`Pipe record created: ${pipe_record_id}`);

  return {
    success: true,
    pipe_record_id,
    customer_name,
    opened_by,
  };
}
