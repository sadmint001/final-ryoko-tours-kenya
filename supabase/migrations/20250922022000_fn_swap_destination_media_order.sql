-- RPC to swap sort_order values between two destination_media rows
create or replace function public.swap_destination_media_order(a_id bigint, b_id bigint)
returns void
language plpgsql
security definer
as $$
declare
  a_order int;
  b_order int;
begin
  select sort_order into a_order from public.destination_media where id = a_id for update;
  select sort_order into b_order from public.destination_media where id = b_id for update;

  if a_order is null or b_order is null then
    raise exception 'One or both media items not found';
  end if;

  update public.destination_media set sort_order = b_order where id = a_id;
  update public.destination_media set sort_order = a_order where id = b_id;
end;
$$;

-- Allow authenticated users (admins via policy) to execute
grant execute on function public.swap_destination_media_order(bigint, bigint) to authenticated;
