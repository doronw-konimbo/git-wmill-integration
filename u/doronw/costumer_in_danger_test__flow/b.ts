// TODO: Once the Pipedrive deal fields are confirmed and the Airtable table
// columns are finalised, map the 5 most important deal sections here.
//
// Likely candidates from the Pipedrive deal object:
//   deal.title        — deal name
//   deal.status       — open / won / lost / deleted
//   deal.value        — deal value
//   deal.owner_name   — assigned owner
//   deal.stage_id     — current pipeline stage
//
// If Airtable has Select fields, wrap values as: { name: value }
// If Airtable has linked-record fields, wrap IDs as: [id]

export async function main(
  _airtable_token: string, // will be used once Airtable push is implemented
  deal_id: string,
  deal: any
) {
  console.log("Deal ID:", deal_id);
  console.log("Deal data received from Pipedrive:", JSON.stringify(deal, null, 2));

  // --- Replace this block once Airtable columns are confirmed ---
  return {
    status: "pending_implementation",
    deal_id,
    message: "Airtable push not yet implemented — confirm table fields first",
  };
  // --------------------------------------------------------------
}
