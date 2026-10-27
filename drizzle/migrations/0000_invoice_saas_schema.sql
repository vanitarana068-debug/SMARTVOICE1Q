create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null default 'My Business',
  owner_name text,
  email text,
  phone text,
  address text,
  gstin text,
  logo_url text,
  currency text not null default 'INR',
  invoice_prefix text not null default 'INV-',
  invoice_next_number integer not null default 1,
  default_tax_rate numeric not null default 18,
  payment_terms_days integer not null default 15,
  default_notes text not null default 'Thank you for your business.',
  plan text not null default 'free',
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  billing_address text,
  gstin text,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  invoice_number text not null,
  status text not null default 'draft' check (status in ('draft','sent','partially_paid','paid')),
  issue_date date not null default current_date,
  due_date date not null,
  currency text not null default 'INR',
  subtotal numeric not null default 0,
  discount_total numeric not null default 0,
  tax_total numeric not null default 0,
  total numeric not null default 0,
  notes text,
  terms text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, invoice_number)
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  position integer not null default 0,
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  tax_rate numeric not null default 0,
  line_total numeric not null default 0
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric not null check (amount > 0),
  payment_date date not null default current_date,
  method text not null default 'bank_transfer',
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.reminder_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  enabled boolean not null default true,
  stages jsonb not null default '[
    {"key":"before_due","offset_days":-3,"enabled":true,"subject":"Upcoming invoice {{invoice_number}}","body":"Hi {{customer_name}},\n\nThis is a friendly note that invoice {{invoice_number}} for {{amount}} is due on {{due_date}}.\n\nThank you!"},
    {"key":"on_due","offset_days":0,"enabled":true,"subject":"Invoice {{invoice_number}} is due today","body":"Hi {{customer_name}},\n\nInvoice {{invoice_number}} for {{amount}} is due today. A quick payment would be much appreciated.\n\nThank you!"},
    {"key":"overdue_3","offset_days":3,"enabled":true,"subject":"Reminder: invoice {{invoice_number}} is overdue","body":"Hi {{customer_name}},\n\nInvoice {{invoice_number}} for {{amount}} was due on {{due_date}} and appears to be outstanding. Could you take a look when you get a moment?\n\nThank you!"},
    {"key":"overdue_7","offset_days":7,"enabled":true,"subject":"Second reminder: invoice {{invoice_number}}","body":"Hi {{customer_name}},\n\nJust a gentle follow-up on invoice {{invoice_number}} for {{amount}}, which was due on {{due_date}}. Please let us know if anything is holding up the payment.\n\nThank you!"},
    {"key":"overdue_14","offset_days":14,"enabled":true,"subject":"Final reminder: invoice {{invoice_number}}","body":"Hi {{customer_name}},\n\nInvoice {{invoice_number}} for {{amount}} remains unpaid since {{due_date}}. We would really appreciate your attention to this, or a quick note on when we can expect payment.\n\nThank you!"}
  ]'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  stage_key text not null,
  status text not null default 'scheduled' check (status in ('scheduled','sent','failed','skipped','no_provider')),
  scheduled_for date not null,
  detail text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (invoice_id, stage_key)
);

create table public.recurring_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  frequency text not null check (frequency in ('weekly','monthly','quarterly','yearly')),
  start_date date not null,
  end_date date,
  next_invoice_date date not null,
  status text not null default 'active' check (status in ('active','paused','cancelled')),
  items jsonb not null default '[]'::jsonb,
  notes text,
  last_generated_at timestamptz,
  created_at timestamptz not null default now()
);

-- Access grants
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select, insert, update, delete on public.customers to authenticated;
grant all on public.customers to service_role;
grant select, insert, update, delete on public.invoices to authenticated;
grant all on public.invoices to service_role;
grant select, insert, update, delete on public.invoice_items to authenticated;
grant all on public.invoice_items to service_role;
grant select, insert, update, delete on public.payments to authenticated;
grant all on public.payments to service_role;
grant select, insert, update, delete on public.reminder_settings to authenticated;
grant all on public.reminder_settings to service_role;
grant select, insert, update, delete on public.reminder_logs to authenticated;
grant all on public.reminder_logs to service_role;
grant select, insert, update, delete on public.recurring_schedules to authenticated;
grant all on public.recurring_schedules to service_role;

-- RLS
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.reminder_settings enable row level security;
alter table public.reminder_logs enable row level security;
alter table public.recurring_schedules enable row level security;

create policy "profiles own row" on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "customers own" on public.customers for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "invoices own" on public.invoices for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "invoice items own" on public.invoice_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "payments own" on public.payments for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reminder settings own" on public.reminder_settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reminder logs own" on public.reminder_logs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "recurring own" on public.recurring_schedules for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Auto-create profile + reminder settings on signup
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, owner_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  insert into public.reminder_settings (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Payment status consistency + stop scheduled reminders when fully paid
create or replace function public.apply_payment_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  inv_total numeric;
  paid_total numeric;
begin
  select total into inv_total from public.invoices where id = new.invoice_id;
  select coalesce(sum(amount), 0) into paid_total from public.payments where invoice_id = new.invoice_id;
  if paid_total >= inv_total then
    update public.invoices set status = 'paid' where id = new.invoice_id;
    update public.reminder_logs set status = 'skipped', detail = 'Invoice fully paid'
    where invoice_id = new.invoice_id and status = 'scheduled';
  elsif paid_total > 0 then
    update public.invoices set status = 'partially_paid' where id = new.invoice_id and status <> 'draft';
  end if;
  return new;
end $$;

create trigger on_payment_recorded after insert on public.payments
for each row execute function public.apply_payment_status();

-- Helpful indexes
create index idx_invoices_user on public.invoices (user_id);
create index idx_invoices_customer on public.invoices (customer_id);
create index idx_invoices_due on public.invoices (due_date);
create index idx_customers_user on public.customers (user_id);
create index idx_payments_invoice on public.payments (invoice_id);
create index idx_reminder_logs_invoice on public.reminder_logs (invoice_id);