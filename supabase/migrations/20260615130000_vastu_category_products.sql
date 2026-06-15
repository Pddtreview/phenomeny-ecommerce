-- Assign core Vastu collection products to the vastu category.
UPDATE products
SET category = 'vastu'
WHERE is_active = true
  AND (
    name ILIKE '%wealth yantra sacred block%'
    OR name ILIKE '%pyrite 7 running horses vastu frame%'
    OR name ILIKE '%dhan yog orgonite pyramid%'
    OR slug ILIKE '%wealth-yantra%sacred%'
    OR slug ILIKE '%wealth-yantra%energy-block%'
    OR slug ILIKE '%7-running-horses%vastu%'
    OR slug ILIKE '%dhan-yog%orgonite%'
  );
