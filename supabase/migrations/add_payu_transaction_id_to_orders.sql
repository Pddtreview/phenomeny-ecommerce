ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payu_transaction_id text;
