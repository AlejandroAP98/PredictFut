-- Add granted_points column to scores table
-- This allows awarding bonus points to users directly from the database
-- without affecting the existing scoring calculation logic.
-- granted_points is included in total_points: granted + earned - spent

alter table public.scores
  add column if not exists granted_points integer default 0;

-- Update handle_new_user to also create a scores row with initial granted_points
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));

  insert into public.scores (user_id, granted_points)
  values (new.id, 55);

  return new;
end;
$$ language plpgsql security definer;