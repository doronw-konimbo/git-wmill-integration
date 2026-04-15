import * as wmill from "windmill-client";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

const DEFAULT_TASKS = [
  {
    name: "Initial Assessment",
    description:
      "Review the customer's situation and gather all relevant information.",
  },
  {
    name: "Contact Customer",
    description:
      "Reach out to the customer to acknowledge the issue and discuss next steps.",
  },
  {
    name: "Resolution Plan",
    description:
      "Create and execute a resolution plan to address the customer's needs.",
  },
];

export async function main(airtable_base_id: string, customer_name: string) {
  const config = await wmill.getFlowUserState("airtable_config");
  const pipe_record_id = await wmill.getFlowUserState("pipe_record_id");

  if (!config || !pipe_record_id) {
    throw new Error(
      "Flow state missing. Ensure steps A and B ran successfully."
    );
  }

  const { api_token, tasks_table } = config;
  const createdTasks: { id: string; name: string }[] = [];

  for (const task of DEFAULT_TASKS) {
    const body = {
      fields: {
        "Task Name": task.name,
        Description: task.description,
        // If "Pipe Record ID" is a linked-record field in Airtable, change this to: [pipe_record_id]
        "Pipe Record ID": pipe_record_id,
        "Customer Name": customer_name.trim(),
        Status: "Pending",
      },
    };

    console.log(`Creating task: "${task.name}"...`);

    const response = await fetch(
      `${AIRTABLE_API_URL}/${airtable_base_id}/${encodeURIComponent(tasks_table)}`,
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
      throw new Error(
        `Airtable error creating task "${task.name}" (${response.status}): ${err}`
      );
    }

    const data = await response.json();
    createdTasks.push({ id: data.id, name: task.name });
    console.log(`Task created: ${data.id}`);
  }

  console.log(`All ${createdTasks.length} tasks created successfully.`);

  return {
    success: true,
    pipe_record_id,
    tasks_created: createdTasks.length,
    tasks: createdTasks,
  };
}
