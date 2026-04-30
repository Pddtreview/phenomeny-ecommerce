import crypto from "crypto";

const PAYU_KEY = process.env.PAYU_MERCHANT_KEY!;
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT!;
const PAYU_BASE_URL = process.env.PAYU_BASE_URL || "https://secure.payu.in";

export function generatePayUHash(params: {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): string {
  const key = process.env.PAYU_MERCHANT_KEY!;
  const salt = process.env.PAYU_MERCHANT_SALT!;
  const amount = Number(params.amount).toFixed(2);

  const hashString = `${String(key).trim()}|${String(params.txnid).trim()}|${amount}|${String(params.productinfo).trim()}|${String(params.firstname).trim()}|${String(params.email).trim()}|${String(params.udf1 || "").trim()}|${String(params.udf2 || "").trim()}|${String(params.udf3 || "").trim()}|${String(params.udf4 || "").trim()}|${String(params.udf5 || "").trim()}||||||${String(salt).trim()}`;

  return crypto.createHash("sha512").update(hashString).digest("hex");
}

export function verifyPayUHash(params: {
  status: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  hash: string;
}): boolean {
  const hashString = [
    PAYU_SALT,
    params.status,
    "",
    "",
    "",
    "",
    "",
    params.udf5 || "",
    params.udf4 || "",
    params.udf3 || "",
    params.udf2 || "",
    params.udf1 || "",
    params.email,
    params.firstname,
    params.productinfo,
    params.amount,
    params.txnid,
    PAYU_KEY,
  ].join("|");

  const expectedHash = crypto.createHash("sha512").update(hashString).digest("hex");
  return expectedHash === params.hash;
}

export { PAYU_BASE_URL, PAYU_KEY };
