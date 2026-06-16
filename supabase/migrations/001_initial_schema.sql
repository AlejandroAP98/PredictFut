-- Create profiles table for user names
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  created_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create predictions table
create table if not exists public.predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  match_id text not null,
  home_score integer not null,
  away_score integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, match_id)
);

-- Enable RLS on predictions
alter table public.predictions enable row level security;

-- Policies for predictions
create policy "Users can view own predictions"
  on public.predictions for select
  using (auth.uid() = user_id);

create policy "Users can insert own predictions"
  on public.predictions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own predictions"
  on public.predictions for update
  using (auth.uid() = user_id);

-- Create scores table
create table if not exists public.scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  total_points integer default 0,
  match_scores jsonb default '{}',
  updated_at timestamptz default now()
);

-- Enable RLS on scores
alter table public.scores enable row level security;

-- Policies for scores
create policy "Users can view all scores"
  on public.scores for select
  using (true);

create policy "Users can insert own scores"
  on public.scores for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scores"
  on public.scores for update
  using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
