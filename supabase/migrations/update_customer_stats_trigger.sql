create or replace function public.update_customer_stats_on_order()
returns trigger
language plpgsql
as $$
begin
  if new.customer_id is null then
    return new;
  end if;

  update public.customers
  set
    order_count = coalesce(order_count, 0) + 1,
    total_spent = coalesce(total_spent, 0) + coalesce(new.total, 0),
    last_order_at = now()
  where id = new.customer_id;

  return new;
end;
$$;

drop trigger if exists trg_update_customer_stats_on_order on public.orders;

create trigger trg_update_customer_stats_on_order
after insert on public.orders
for each row
execute function public.update_customer_stats_on_order();

