-- Migration: Create projects table for project showcase

create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  tagline text,
  description text,
  image text,
  category text,
  technologies text[],
  demo_url text,
  source_files jsonb,
  featured boolean default false,
  downloads integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  owner_id uuid references auth.users(id) on delete cascade
);

-- Enable Row Level Security
alter table projects enable row level security;

-- Policy: Anyone can read
create policy "Anyone can view projects" on projects
  for select using (true);

-- Policy: Only owner can insert
create policy "Users can insert their own projects" on projects
  for insert with check (auth.uid() = owner_id);

-- Policy: Only owner can update
create policy "Only owner can update their project" on projects
  for update using (auth.uid() = owner_id);

-- Policy: Only owner can delete
create policy "Only owner can delete their project" on projects
  for delete using (auth.uid() = owner_id); 