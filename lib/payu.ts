import crypto from "crypto";

const PAYU_KEY = process.env.PAYU_MERCHANT_KEY!;
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT!;
const PAYU_SALT2 = process.env.PAYU_MERCHANT_SALT2 || "";
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
  const key = (process.env.PAYU_MERCHANT_KEY || "").trim();
  const salt = (process.env.PAYU_MERCHANT_SALT || "").trim();
  const salt2 = (process.env.PAYU_MERCHANT_SALT2 || "").trim();
  const clean = (value: unknown) => String(value ?? "").trim();
  const amount = Number(clean(params.amount)).toFixed(2);

  const hashString =
    key +
    "|" +
    clean(params.txnid) +
    "|" +
    amount +
    "|" +
    clean(params.productinfo) +
    "|" +
    clean(params.firstname) +
    "|" +
    clean(params.email) +
    "|" +
    clean(params.udf1 || "") +
    "|" +
    clean(params.udf2 || "") +
    "|" +
    clean(params.udf3 || "") +
    "|" +
    clean(params.udf4 || "") +
    "|" +
    clean(params.udf5 || "") +
    "||||||" +
    salt;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  console.log("EXACT HASH STRING LENGTH:", hashString.length);
  console.log("EXACT HASH STRING:", hashString);
  console.log("PAYU HASH (SALT1):", hash);

  if (salt2) {
    const hashStringSalt2 = hashString.slice(0, hashString.lastIndexOf("|") + 1) + salt2;
    const hashSalt2 = crypto
      .createHash("sha512")
      .update(hashStringSalt2)
      .digest("hex");
    console.log("EXACT HASH STRING (SALT2):", hashStringSalt2);
    console.log("PAYU HASH (SALT2):", hashSalt2);
  }

  return hash;
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

export { PAYU_BASE_URL, PAYU_KEY, PAYU_SALT, PAYU_SALT2 };
