-- Dhan Yog Orgonite Pyramid: ensure active variant price is 699 (INR).
UPDATE product_variants AS pv
SET price = 699
FROM products AS p
WHERE pv.product_id = p.id
  AND (
    p.name ILIKE '%dhan yog%orgonite%pyramid%'
    OR p.slug ILIKE '%dhan-yog%orgonite%pyramid%'
    OR p.slug ILIKE '%dhan-yog-orgonite%'
  );
