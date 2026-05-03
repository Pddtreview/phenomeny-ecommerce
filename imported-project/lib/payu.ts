import crypto from "crypto";

const PAYU_KEY = process.env.PAYU_MERCHANT_KEY ?? "";
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT ?? "";
const PAYU_SALT2 = process.env.PAYU_MERCHANT_SALT2 ?? "";
const PAYU_BASE_URL =
  process.env.PAYU_BASE_URL || "https://secure.payu.in";

const DEBUG_PAYU = process.env.PAYU_DEBUG === "1";

const clean = (value: unknown) => String(value ?? "").trim();

/**
 * PayU India v1 request hash:
 *   sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 *
 * - amount must be sent in the form with the SAME formatting used here
 *   (we format with toFixed(2) and the form must use the same string).
 * - Any UDF (udf1..udf5) included in the form MUST also be included in the
 *   hash with the exact same value.
 */
export function generatePayUHash(params: {
  txnid: string;
  amount: string | number;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): { hash: string; amount: string; hashStringPreview: string } {
  const key = clean(PAYU_KEY);
  const salt = clean(PAYU_SALT);
  const amount = Number(clean(params.amount)).toFixed(2);

  const hashString = [
    key,
    clean(params.txnid),
    amount,
    clean(params.productinfo),
    clean(params.firstname),
    clean(params.email),
    clean(params.udf1),
    clean(params.udf2),
    clean(params.udf3),
    clean(params.udf4),
    clean(params.udf5),
    "",
    "",
    "",
    "",
    "",
    salt,
  ].join("|");

  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  // Preview hides the salt so it can be safely logged for debugging.
  const hashStringPreview = hashString.replace(salt, "[SALT]");

  if (DEBUG_PAYU) {
    console.log("[payu] hash string (salt redacted):", hashStringPreview);
    console.log("[payu] hash:", hash);
  }

  return { hash, amount, hashStringPreview };
}

/**
 * PayU response hash (from webhook):
 *   sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
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
  const salt = clean(PAYU_SALT);
  const key = clean(PAYU_KEY);

  const hashString = [
    salt,
    clean(params.status),
    "",
    "",
    "",
    "",
    "",
    clean(params.udf5),
    clean(params.udf4),
    clean(params.udf3),
    clean(params.udf2),
    clean(params.udf1),
    clean(params.email),
    clean(params.firstname),
    clean(params.productinfo),
    clean(params.amount),
    clean(params.txnid),
    key,
  ].join("|");

  const expected = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  if (expected === clean(params.hash)) return true;

  // Also try SALT2 if configured (PayU rotates salts during migration windows).
  if (PAYU_SALT2) {
    const salt2 = clean(PAYU_SALT2);
    const hashStringSalt2 = [
      salt2,
      clean(params.status),
      "",
      "",
      "",
      "",
      "",
      clean(params.udf5),
      clean(params.udf4),
      clean(params.udf3),
      clean(params.udf2),
      clean(params.udf1),
      clean(params.email),
      clean(params.firstname),
      clean(params.productinfo),
      clean(params.amount),
      clean(params.txnid),
      key,
    ].join("|");
    const expected2 = crypto
      .createHash("sha512")
      .update(hashStringSalt2)
      .digest("hex");
    return expected2 === clean(params.hash);
  }

  return false;
}

export { PAYU_BASE_URL, PAYU_KEY, PAYU_SALT, PAYU_SALT2 };
