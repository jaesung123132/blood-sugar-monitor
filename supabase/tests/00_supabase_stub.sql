-- CI 전용: 일반 PostgreSQL에 Supabase가 기본으로 갖고 있는 구성(역할, auth 스키마)을 흉내 냅니다.
-- 실제 Supabase에는 이미 있으므로 이 파일을 Supabase에서 실행하지 마세요.

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;

create table auth.users (
  id uuid primary key
);

-- Supabase의 auth.uid()와 같은 방식: 로그인 토큰의 sub(사용자 ID)를 읽습니다.
create function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated;
