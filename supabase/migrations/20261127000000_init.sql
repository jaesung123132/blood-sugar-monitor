-- 혈당 도우미 데이터베이스 첫 구조 (Supabase / PostgreSQL)
--
-- 보안 원칙
-- 1. 모든 표에 행 단위 보안(RLS)을 켭니다. 정책이 없는 동작은 모두 막힙니다.
-- 2. 같은 가족 구성원만 그 가족의 기록을 읽고 쓸 수 있습니다.
-- 3. 기록은 반드시 '나'의 이름으로만 만들 수 있습니다(created_by 위조 금지).
-- 4. 가족 만들기와 구성원 추가는 앱 화면이 아니라 서버 함수(비밀 키 사용)만 할 수 있습니다.
--    아무나 다른 가족에 자기 자신을 추가하지 못하게 하기 위해서입니다.
-- 5. 사진 분석 사용 요금 기록(api_usage)은 서버만 쓰고, 가족은 읽기만 합니다.
-- 6. 로그인하지 않은 사용자(anon)는 아무것도 할 수 없습니다.
--
-- 이 파일은 Supabase 대시보드의 SQL Editor에서 한 번만 실행합니다.
-- 같은 내용을 GitHub Actions가 커밋마다 빈 PostgreSQL에 적용해 보안 규칙을 자동으로 검사합니다.

-- ── 표 ──

create table public.families (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);
comment on table public.families is '가족 묶음. 구성원만 기록을 공유한다.';

create table public.family_members (
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('parent', 'caregiver')),
  display_name text not null check (char_length(display_name) between 1 and 20),
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);
comment on table public.family_members is '가족 구성원. parent = 부모님(기록하는 분), caregiver = 자녀(관리하는 분). 서버만 추가한다.';

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  person_id uuid not null,
  eaten_at timestamptz not null,
  input_method text not null check (input_method in ('photo', 'search', 'label')),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (id, family_id),
  foreign key (family_id, person_id) references public.family_members (family_id, user_id) on delete cascade
);
comment on table public.meals is '식사 한 끼. person_id는 드신 분, created_by는 기록한 분.';

create table public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null,
  family_id uuid not null,
  name text not null check (char_length(name) between 1 and 100),
  source text not null check (source in ('mfds', 'label', 'manual')),
  food_code text check (food_code is null or char_length(food_code) between 1 and 50),
  grams numeric not null check (grams > 0 and grams <= 5000),
  per100g jsonb not null check (jsonb_typeof(per100g) = 'object'),
  source_checked_on date,
  confirmed boolean not null default false,
  confirmed_by uuid references auth.users (id) on delete set null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (meal_id, family_id) references public.meals (id, family_id) on delete cascade,
  check (source <> 'mfds' or food_code is not null),
  check (confirmed = (confirmed_at is not null))
);
comment on table public.meal_items is '식사에 들어간 음식. per100g는 조회 당시의 100 g당 영양값(값이 없으면 null). 사람이 확인(confirmed)한 항목만 합계에 들어간다.';

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  person_id uuid not null,
  kind text not null check (kind in ('walk', 'cycle', 'swim', 'hike', 'strength', 'balance', 'other')),
  minutes integer not null check (minutes between 1 and 600),
  intensity text not null check (intensity in ('light', 'moderate', 'vigorous')),
  after_meal boolean not null default false,
  started_at timestamptz not null,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (family_id, person_id) references public.family_members (family_id, user_id) on delete cascade
);
comment on table public.activities is '운동 기록(식후 걷기 포함).';

create table public.lab_results (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null,
  person_id uuid not null,
  kind text not null check (kind in ('hba1c', 'fasting_glucose', 'weight', 'waist')),
  value numeric not null check (value > 0),
  unit text not null,
  measured_on date not null,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (family_id, person_id) references public.family_members (family_id, user_id) on delete cascade,
  -- 단위 실수를 막기 위한 입력 형식 확인입니다(의학 기준값이 아님).
  check (
    (kind = 'hba1c' and unit = '%')
    or (kind = 'fasting_glucose' and unit = 'mg/dL')
    or (kind = 'weight' and unit = 'kg')
    or (kind = 'waist' and unit = 'cm')
  )
);
comment on table public.lab_results is '병원 검사 결과(당화혈색소, 공복혈당, 체중, 허리둘레).';

create table public.api_usage (
  id bigint generated always as identity primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  occurred_at timestamptz not null default now(),
  model text not null check (char_length(model) between 1 and 100),
  input_tokens integer not null check (input_tokens >= 0),
  output_tokens integer not null check (output_tokens >= 0),
  cost_usd numeric(10, 6) not null check (cost_usd >= 0)
);
comment on table public.api_usage is '사진 분석 사용량과 요금. 월 상한 확인에 쓴다. 서버만 기록한다.';

-- ── 색인(조회 속도) ──

create index family_members_user_idx on public.family_members (user_id);
create index meals_family_eaten_idx on public.meals (family_id, eaten_at desc);
create index meal_items_meal_idx on public.meal_items (meal_id);
create index activities_family_started_idx on public.activities (family_id, started_at desc);
create index lab_results_family_measured_idx on public.lab_results (family_id, measured_on desc);
create index api_usage_family_occurred_idx on public.api_usage (family_id, occurred_at desc);

-- ── 가족 구성원 확인 함수 ──
-- security definer: 정책 안에서 family_members를 다시 검사하다가 무한 반복되지 않게 합니다.
-- search_path를 비워 두고 모든 이름을 스키마까지 써서 가로채기 공격을 막습니다.

create function public.is_family_member(target_family uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members as m
    where m.family_id = target_family
      and m.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_family_member(uuid) from public, anon;
grant execute on function public.is_family_member(uuid) to authenticated;

-- ── 행 단위 보안 켜기 ──

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.activities enable row level security;
alter table public.lab_results enable row level security;
alter table public.api_usage enable row level security;

-- ── 표 권한 (어떤 행에 닿는지는 아래 정책이 정합니다) ──

revoke all on table
  public.families, public.family_members, public.meals, public.meal_items,
  public.activities, public.lab_results, public.api_usage
from anon, authenticated;

-- 가족·구성원·요금 기록은 읽기만 (쓰기는 서버 함수가 비밀 키로 합니다)
grant select on table public.families, public.family_members, public.api_usage to authenticated;

-- 일상 기록은 가족 구성원이 읽고 쓸 수 있음
grant select, insert, update, delete on table
  public.meals, public.meal_items, public.activities, public.lab_results
to authenticated;

-- ── 정책 ──

create policy "가족 정보 보기" on public.families
  for select to authenticated
  using (public.is_family_member(id));

create policy "구성원 목록 보기" on public.family_members
  for select to authenticated
  using (public.is_family_member(family_id));

create policy "사용 요금 보기" on public.api_usage
  for select to authenticated
  using (public.is_family_member(family_id));

create policy "식사 보기" on public.meals
  for select to authenticated
  using (public.is_family_member(family_id));
create policy "식사 추가" on public.meals
  for insert to authenticated
  with check (public.is_family_member(family_id) and created_by = (select auth.uid()));
create policy "식사 고치기" on public.meals
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "식사 지우기" on public.meals
  for delete to authenticated
  using (public.is_family_member(family_id));

create policy "음식 항목 보기" on public.meal_items
  for select to authenticated
  using (public.is_family_member(family_id));
create policy "음식 항목 추가" on public.meal_items
  for insert to authenticated
  with check (public.is_family_member(family_id));
create policy "음식 항목 고치기" on public.meal_items
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "음식 항목 지우기" on public.meal_items
  for delete to authenticated
  using (public.is_family_member(family_id));

create policy "운동 보기" on public.activities
  for select to authenticated
  using (public.is_family_member(family_id));
create policy "운동 추가" on public.activities
  for insert to authenticated
  with check (public.is_family_member(family_id) and created_by = (select auth.uid()));
create policy "운동 고치기" on public.activities
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "운동 지우기" on public.activities
  for delete to authenticated
  using (public.is_family_member(family_id));

create policy "검사 결과 보기" on public.lab_results
  for select to authenticated
  using (public.is_family_member(family_id));
create policy "검사 결과 추가" on public.lab_results
  for insert to authenticated
  with check (public.is_family_member(family_id) and created_by = (select auth.uid()));
create policy "검사 결과 고치기" on public.lab_results
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy "검사 결과 지우기" on public.lab_results
  for delete to authenticated
  using (public.is_family_member(family_id));
