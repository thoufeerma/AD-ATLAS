/**
 * India's states and union territories, as the API stores them (the list with
 * GST codes lives in backend/src/lib/gst.ts). Addresses pick from this list:
 * the invoice needs the exact state to charge CGST + SGST or IGST.
 */
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

const squash = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");

/**
 * A saved or typed state as it appears in the list ("tamilnadu" → "Tamil
 * Nadu"), or "" so the dropdown asks for it. The API also accepts common
 * short forms like "TN"; this only needs to recognise the names.
 */
export function listedState(text: string | null | undefined): string {
  const key = squash(text ?? "");
  return INDIAN_STATES.find((s) => squash(s) === key) ?? "";
}
