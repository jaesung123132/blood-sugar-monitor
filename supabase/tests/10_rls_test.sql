-- CI 전용: 가족끼리만 기록을 볼 수 있는지 보안 규칙(RLS)을 검사합니다.
-- 하나라도 어긋나면 오류를 내서 자동 검사가 실패합니다.
--
-- 등장인물
--   A: 가족 1의 자녀(caregiver)
--   B: 가족 1의 부모님(parent)
--   C: 가족 2의 부모님(parent)
--   D: 아무 가족에도 속하지 않은 사람

-- ── 준비 (관리자 권한) ──

insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b'),
  ('00000000-0000-0000-0000-00000000000c'),
  ('00000000-0000-0000-0000-00000000000d');

insert into public.families (id) values
  ('10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002');

insert into public.family_members (family_id, user_id, role, display_name) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'caregiver', '자녀'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'parent', '아버지'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000c', 'parent', '다른 집');

insert into public.meals (id, family_id, person_id, eaten_at, input_method, created_by) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-00000000000b', now(), 'search', '00000000-0000-0000-0000-00000000000a'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-00000000000c', now(), 'search', '00000000-0000-0000-0000-00000000000c');

insert into public.api_usage (family_id, model, input_tokens, output_tokens, cost_usd) values
  ('10000000-0000-0000-0000-000000000001', 'test-model', 1000, 500, 0.014);

-- ── A(가족 1 자녀)로 로그인한 상태 ──

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);

do $$
declare
  n integer;
begin
  select count(*) into n from public.meals;
  if n <> 1 then
    raise exception 'A는 자기 가족 식사 1건만 봐야 하는데 %건을 봄', n;
  end if;

  select count(*) into n from public.family_members;
  if n <> 2 then
    raise exception 'A는 자기 가족 구성원 2명만 봐야 하는데 %명을 봄', n;
  end if;

  select count(*) into n from public.families;
  if n <> 1 then
    raise exception 'A는 자기 가족 1개만 봐야 하는데 %개를 봄', n;
  end if;

  select count(*) into n from public.api_usage;
  if n <> 1 then
    raise exception 'A는 자기 가족 요금 기록 1건만 봐야 하는데 %건을 봄', n;
  end if;
end
$$;

-- 자기 가족 기록은 추가할 수 있어야 함 (created_by는 자동으로 A)
insert into public.meals (family_id, person_id, eaten_at, input_method)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', now(), 'photo');

insert into public.meal_items (meal_id, family_id, name, source, food_code, grams, per100g)
values ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
        '테스트 음식', 'mfds', 'TEST-001', 210, '{"energyKcal": 100, "sugarsG": null}'::jsonb);

insert into public.activities (family_id, person_id, kind, minutes, intensity, after_meal, started_at)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b',
        'walk', 15, 'moderate', true, now());

insert into public.lab_results (family_id, person_id, kind, value, unit, measured_on)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b',
        'hba1c', 5.9, '%', current_date);

do $$
begin
  -- 다른 가족 기록 추가는 막혀야 함
  begin
    insert into public.meals (family_id, person_id, eaten_at, input_method)
    values ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000c', now(), 'photo');
    raise exception '다른 가족 식사를 추가할 수 있으면 안 됨';
  exception
    when insufficient_privilege then
      null;
  end;

  -- 다른 사람 이름(created_by)으로 기록을 만들 수 없어야 함
  begin
    insert into public.meals (family_id, person_id, eaten_at, input_method, created_by)
    values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', now(), 'photo',
            '00000000-0000-0000-0000-00000000000b');
    raise exception '다른 사람 이름으로 기록을 만들 수 있으면 안 됨';
  exception
    when insufficient_privilege then
      null;
  end;

  -- 스스로 다른 가족에 들어갈 수 없어야 함
  begin
    insert into public.family_members (family_id, user_id, role, display_name)
    values ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000a', 'caregiver', '침입');
    raise exception '스스로 다른 가족에 들어갈 수 있으면 안 됨';
  exception
    when insufficient_privilege then
      null;
  end;

  -- 앱 사용자가 요금 기록을 쓸 수 없어야 함(서버만 기록)
  begin
    insert into public.api_usage (family_id, model, input_tokens, output_tokens, cost_usd)
    values ('10000000-0000-0000-0000-000000000001', 'test-model', 0, 0, 0);
    raise exception '앱 사용자가 요금 기록을 쓸 수 있으면 안 됨';
  exception
    when insufficient_privilege then
      null;
  end;

  -- 다른 가족 식사에 음식을 끼워 넣을 수 없어야 함(가족 번호를 속여도)
  begin
    insert into public.meal_items (meal_id, family_id, name, source, grams, per100g)
    values ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
            '침입 음식', 'manual', 100, '{}'::jsonb);
    raise exception '다른 가족 식사에 음식을 끼워 넣을 수 있으면 안 됨';
  exception
    when foreign_key_violation then
      null;
  end;

  -- 식약처 DB 음식은 식품코드가 꼭 있어야 함(출처 추적)
  begin
    insert into public.meal_items (meal_id, family_id, name, source, grams, per100g)
    values ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
            '코드 없는 음식', 'mfds', 100, '{}'::jsonb);
    raise exception '식품코드 없이 식약처 음식을 저장할 수 있으면 안 됨';
  exception
    when check_violation then
      null;
  end;

  -- 검사 결과는 정해진 단위만 받아야 함
  begin
    insert into public.lab_results (family_id, person_id, kind, value, unit, measured_on)
    values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b',
            'hba1c', 5.9, 'mg/dL', current_date);
    raise exception '당화혈색소를 잘못된 단위로 저장할 수 있으면 안 됨';
  exception
    when check_violation then
      null;
  end;
end
$$;

do $$
declare
  n integer;
begin
  -- 다른 가족 기록은 고치거나 지울 수 없어야 함(보이지 않으므로 0건)
  update public.meals set input_method = 'label' where id = '30000000-0000-0000-0000-000000000002';
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception '다른 가족 식사를 고칠 수 있으면 안 됨 (%건 변경)', n;
  end if;

  delete from public.meals where id = '30000000-0000-0000-0000-000000000002';
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception '다른 가족 식사를 지울 수 있으면 안 됨 (%건 삭제)', n;
  end if;
end
$$;

-- ── B(가족 1 부모님): 음식을 확인(confirmed)할 수 있어야 함 ──

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);

do $$
declare
  n integer;
begin
  update public.meal_items
  set confirmed = true, confirmed_at = now(), confirmed_by = (select auth.uid())
  where family_id = '10000000-0000-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'B가 자기 가족 음식 1건을 확인해야 하는데 %건', n;
  end if;

  -- 확인 상태와 확인 시각은 항상 함께 있어야 함
  begin
    update public.meal_items set confirmed_at = null where family_id = '10000000-0000-0000-0000-000000000001';
    raise exception '확인 시각 없이 확인 상태로 남을 수 있으면 안 됨';
  exception
    when check_violation then
      null;
  end;
end
$$;

-- ── C(가족 2): 가족 1의 기록을 볼 수 없어야 함 ──

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000c', false);

do $$
declare
  n integer;
begin
  select count(*) into n from public.meals;
  if n <> 1 then
    raise exception 'C는 자기 가족 식사 1건만 봐야 하는데 %건을 봄', n;
  end if;

  select count(*) into n from public.meal_items;
  if n <> 0 then
    raise exception 'C는 다른 가족 음식을 보면 안 되는데 %건을 봄', n;
  end if;

  select count(*) into n from public.activities;
  if n <> 0 then
    raise exception 'C는 다른 가족 운동을 보면 안 되는데 %건을 봄', n;
  end if;

  select count(*) into n from public.lab_results;
  if n <> 0 then
    raise exception 'C는 다른 가족 검사 결과를 보면 안 되는데 %건을 봄', n;
  end if;

  select count(*) into n from public.api_usage;
  if n <> 0 then
    raise exception 'C는 다른 가족 요금 기록을 보면 안 되는데 %건을 봄', n;
  end if;
end
$$;

-- ── D(가족 없음): 아무것도 보거나 쓸 수 없어야 함 ──

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000d', false);

do $$
declare
  n integer;
begin
  select count(*) into n from public.meals;
  if n <> 0 then
    raise exception 'D는 아무 식사도 보면 안 되는데 %건을 봄', n;
  end if;

  select count(*) into n from public.family_members;
  if n <> 0 then
    raise exception 'D는 아무 구성원도 보면 안 되는데 %명을 봄', n;
  end if;

  begin
    insert into public.meals (family_id, person_id, eaten_at, input_method)
    values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', now(), 'photo');
    raise exception '가족이 아닌 사람이 기록을 추가할 수 있으면 안 됨';
  exception
    when insufficient_privilege then
      null;
  end;
end
$$;

-- ── 로그인하지 않은 사용자(anon): 표에 접근조차 못 해야 함 ──

reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);

do $$
begin
  begin
    perform count(*) from public.meals;
    raise exception '로그인하지 않은 사용자가 식사 기록을 읽을 수 있으면 안 됨';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    perform count(*) from public.family_members;
    raise exception '로그인하지 않은 사용자가 구성원 목록을 읽을 수 있으면 안 됨';
  exception
    when insufficient_privilege then
      null;
  end;
end
$$;

reset role;
select '보안 규칙(RLS) 테스트를 모두 통과했습니다.' as result;
