import * as wmill from "windmill-client";

export async function main(
  airtable_base_id: string,
  customer_name: string,
  opened_by: string
) {
  if (!airtable_base_id?.trim()) throw new Error("airtable_base_id is required");
  if (!customer_name?.trim()) throw new Error("customer_name is required");
  if (!opened_by?.trim()) throw new Error("opened_by is required");

  const api_token =
    process.env.AIRTABLE_API_TOKEN ||
    (await wmill.getVariable("u/doronw/AIRTABLE_API_TOKEN"));

  if (!api_token)
    throw new Error(
      "AIRTABLE_API_TOKEN is missing. Set it as u/doronw/AIRTABLE_API_TOKEN in Windmill."
    );

  const pipes_table =
    process.env.AIRTABLE_PIPES_TABLE ||
    (await wmill.getVariable("u/doronw/AIRTABLE_PIPES_TABLE")) ||
    "Pipes";

  const tasks_table =
    process.env.AIRTABLE_TASKS_TABLE ||
    (await wmill.getVariable("u/doronw/AIRTABLE_TASKS_TABLE")) ||
    "Tasks";

  await wmill.setFlowUserState("airtable_config", {
    api_token,
    pipes_table,
    tasks_table,
  });

  console.log("Payload validated successfully.");
  console.log(`Customer: "${customer_name}", Opened by: "${opened_by}"`);
  console.log(
    `Airtable base: "${airtable_base_id}", Pipes table: "${pipes_table}", Tasks table: "${tasks_table}"`
  );

  return {
    success: true,
    customer_name: customer_name.trim(),
    opened_by: opened_by.trim(),
    airtable_base_id: airtable_base_id.trim(),
    pipes_table,
    tasks_table,
  };
}
