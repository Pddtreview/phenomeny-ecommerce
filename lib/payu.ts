import crypto from "crypto";

const PAYU_KEY = process.env.PAYU_MERCHANT_KEY ?? "";
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT ?? "";
const PAYU_SALT2 = process.env.PAYU_MERCHANT_SALT2 ?? "";
const PAYU_BASE_URL =
  process.env.PAYU_BASE_URL || "https://secure.payu.in";

const clean = (value: unknown) => String(value ?? "").trim();

export function generatePayUHash({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  salt,
}: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
}): string {
  // PayU hash formula - no UDF fields
  // key|txnid|amount|productinfo|firstname|email|||||||||||salt
  const str = [
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    "", // udf1
    "", // udf2
    "", // udf3
    "", // udf4
    "", // udf5
    "", // additional1
    "", // additional2
    "", // additional3
    "", // additional4
    "", // additional5
    salt,
  ].join("|");

  console.log("PayU hash string:", str);
  console.log("PayU hash string length:", str.length);

  return crypto.createHash("sha512").update(str).digest("hex");
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
