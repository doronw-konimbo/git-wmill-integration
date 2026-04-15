export async function main(
  airtable_token: string,
  pipe_record_id: string,
  contact: string
) {
  try {
    const response = await fetch(
      'https://api.airtable.com/v0/apprmdV0Z2TTNaYX4/tasks', // ← update table name to match your Airtable
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${airtable_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                'Task Name': 'Initial Assessment',
                'Pipe': [pipe_record_id], // array = linked-record field; use plain string if text field
                Contact: contact,
                Status: { name: 'Pending' },
              },
            },
            {
              fields: {
                'Task Name': 'Contact Customer',
                'Pipe': [pipe_record_id],
                Contact: contact,
                Status: { name: 'Pending' },
              },
            },
            {
              fields: {
                'Task Name': 'Resolution Plan',
                'Pipe': [pipe_record_id],
                Contact: contact,
                Status: { name: 'Pending' },
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Airtable API Error: ${response.status} - ${errorDetails}`);
    }

    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}
