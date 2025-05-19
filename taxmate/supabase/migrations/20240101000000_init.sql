-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  amount decimal(10,2) not null,
  merchant text not null,
  category text,
  notes text,
  categorization_source text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create form_jobs table
create table public.form_jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null check (type in ('schedule_c', '1099')),
  status text not null check (status in ('queued', 'processing', 'done', 'error')) default 'queued',
  result_url text,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subscriptions table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('free_trial', 'solo', 'seasonal')),
  status text not null check (status in ('active', 'cancelled', 'past_due')),
  started_at timestamp with time zone not null,
  ends_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create errors table for monitoring
create table public.errors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  error_type text not null,
  error_message text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.transactions enable row level security;
alter table public.form_jobs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.errors enable row level security;

-- RLS Policies for users table
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- RLS Policies for transactions table
create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions" on public.transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete own transactions" on public.transactions
  for delete using (auth.uid() = user_id);

-- RLS Policies for form_jobs table
create policy "Users can view own form jobs" on public.form_jobs
  for select using (auth.uid() = user_id);

create policy "Users can insert own form jobs" on public.form_jobs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own form jobs" on public.form_jobs
  for update using (auth.uid() = user_id);

-- RLS Policies for subscriptions table  
create policy "Users can view own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

-- RLS Policies for errors table
create policy "Users can view own errors" on public.errors
  for select using (auth.uid() = user_id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  
  -- Create free trial subscription
  insert into public.subscriptions (user_id, plan, status, started_at, ends_at)
  values (
    new.id, 
    'free_trial', 
    'active', 
    now(), 
    now() + interval '7 days'
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_users_updated_at before update on public.users
  for each row execute procedure public.update_updated_at_column();

create trigger update_transactions_updated_at before update on public.transactions
  for each row execute procedure public.update_updated_at_column();

create trigger update_form_jobs_updated_at before update on public.form_jobs
  for each row execute procedure public.update_updated_at_column();

create trigger update_subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.update_updated_at_column();

-- Create indexes for performance
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_date on public.transactions(date);
create index idx_form_jobs_user_id on public.form_jobs(user_id);
create index idx_form_jobs_status on public.form_jobs(status);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_errors_user_id on public.errors(user_id);