-- Esquema inicial de Aerion para un proyecto Supabase nuevo.
-- Ejecutar en el SQL Editor de Supabase con el rol postgres.

begin;

create extension if not exists pgcrypto;

create table if not exists public.organizaciones (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    codigo_invitacion text not null unique,
    creado_por uuid references auth.users(id) on delete set null default auth.uid(),
    created_at timestamptz not null default now()
);

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    nombre text not null default '',
    apellido text not null default '',
    email text not null default coalesce((auth.jwt() ->> 'email'), ''),
    zona_horaria text not null default 'America/Guayaquil',
    organizacion_id uuid not null references public.organizaciones(id) on delete restrict,
    estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
    ultimo_acceso timestamptz,
    created_at timestamptz not null default now(),
    unique (id, organizacion_id)
);

create table if not exists public.equipos (
    id uuid primary key default gen_random_uuid(),
    organizacion_id uuid not null references public.organizaciones(id) on delete cascade,
    nombre text not null,
    codigo text not null,
    zona_horaria text not null default 'America/Guayaquil',
    responsable_id uuid references public.profiles(id) on delete set null,
    estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
    created_at timestamptz not null default now(),
    unique (id, organizacion_id),
    unique (organizacion_id, codigo)
);

create table if not exists public.cargos (
    id uuid primary key default gen_random_uuid(),
    organizacion_id uuid not null references public.organizaciones(id) on delete cascade,
    nombre text not null,
    descripcion text,
    estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
    created_at timestamptz not null default now(),
    unique (id, organizacion_id),
    unique (organizacion_id, nombre)
);

create table if not exists public.roles (
    id uuid primary key default gen_random_uuid(),
    organizacion_id uuid not null references public.organizaciones(id) on delete cascade,
    nombre text not null,
    nivel text not null check (
        nivel in (
            'superadmin',
            'admin_organizacion',
            'admin_equipo',
            'supervisor',
            'revisor',
            'consulta'
        )
    ),
    estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
    created_at timestamptz not null default now(),
    unique (id, organizacion_id),
    unique (organizacion_id, nombre)
);

create table if not exists public.permisos (
    id uuid primary key default gen_random_uuid(),
    nombre text not null unique,
    descripcion text
);

create table if not exists public.roles_permisos (
    rol_id uuid not null references public.roles(id) on delete cascade,
    permiso_id uuid not null references public.permisos(id) on delete cascade,
    primary key (rol_id, permiso_id)
);

create table if not exists public.asignaciones (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null,
    organizacion_id uuid not null,
    equipo_id uuid not null,
    rol_id uuid not null,
    cargo_id uuid,
    estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
    created_at timestamptz not null default now(),
    foreign key (usuario_id, organizacion_id)
        references public.profiles(id, organizacion_id) on delete cascade,
    foreign key (equipo_id, organizacion_id)
        references public.equipos(id, organizacion_id) on delete cascade,
    foreign key (rol_id, organizacion_id)
        references public.roles(id, organizacion_id) on delete restrict,
    foreign key (cargo_id, organizacion_id)
        references public.cargos(id, organizacion_id) on delete restrict
);

create table if not exists public.revisiones (
    id uuid primary key default gen_random_uuid(),
    codigo text not null,
    titulo text not null,
    descripcion text,
    equipo_id uuid not null references public.equipos(id) on delete restrict,
    responsable_id uuid references public.profiles(id) on delete set null,
    creado_por uuid references public.profiles(id) on delete set null,
    fecha_inicio_plazo timestamptz not null,
    fecha_fin_plazo timestamptz not null,
    zona_horaria_plazo text not null default 'America/Guayaquil',
    fecha_inicio_real timestamptz,
    fecha_fin_real timestamptz,
    cancelada boolean not null default false,
    created_at timestamptz not null default now(),
    check (fecha_fin_plazo >= fecha_inicio_plazo),
    unique (equipo_id, codigo)
);

create table if not exists public.revision_eventos (
    id uuid primary key default gen_random_uuid(),
    revision_id uuid not null references public.revisiones(id) on delete cascade,
    tipo_evento text not null,
    actor_id uuid references public.profiles(id) on delete set null,
    fecha_hora timestamptz not null default now()
);

create table if not exists public.evidencias (
    id uuid primary key default gen_random_uuid(),
    revision_id uuid not null references public.revisiones(id) on delete cascade,
    subido_por uuid references public.profiles(id) on delete set null,
    storage_path text not null,
    nombre_archivo text not null,
    created_at timestamptz not null default now(),
    unique (storage_path),
    check (storage_path like revision_id::text || '/%')
);

create table if not exists public.auditoria (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid references public.profiles(id) on delete set null,
    accion text not null,
    recurso text not null,
    recurso_id text,
    contexto jsonb default '{}'::jsonb,
    resultado text not null default 'exito' check (resultado in ('exito', 'fallo')),
    mensaje text,
    fecha_hora timestamptz not null default now()
);

create table if not exists public.notificaciones (
    id uuid primary key default gen_random_uuid(),
    evento text not null,
    destinatario_id uuid not null references public.profiles(id) on delete cascade,
    revision_id uuid references public.revisiones(id) on delete cascade,
    mensaje text not null,
    estado text not null default 'no_leida' check (estado in ('no_leida', 'leida')),
    leida_at timestamptz,
    creado_por uuid references public.profiles(id) on delete set null default auth.uid(),
    created_at timestamptz not null default now()
);

create table if not exists public.proyectos (
    id uuid primary key default gen_random_uuid(),
    organizacion_id uuid not null references public.organizaciones(id) on delete cascade,
    codigo text not null,
    nombre text not null,
    descripcion text,
    imagen_url text,
    imagen_path text,
    creado_por uuid references public.profiles(id) on delete set null,
    estado text not null default 'en_progreso'
        check (estado in ('en_progreso', 'pausado', 'finalizado', 'cancelado')),
    version integer not null default 1 check (version >= 1),
    cantidad_pruebas integer not null default 0 check (cantidad_pruebas >= 0),
    created_at timestamptz not null default now(),
    unique (id, organizacion_id),
    unique (organizacion_id, codigo)
);

create table if not exists public.riesgos (
    id uuid primary key default gen_random_uuid(),
    organizacion_id uuid not null references public.organizaciones(id) on delete cascade,
    proyecto_id uuid,
    codigo text not null,
    nombre text not null,
    descripcion text,
    categoria text,
    activo text,
    amenaza text,
    probabilidad integer not null default 3 check (probabilidad between 1 and 5),
    impacto integer not null default 3 check (impacto between 1 and 5),
    nivel_inherente integer generated always as (probabilidad * impacto) stored,
    tratamiento text not null default 'Mitigar',
    estado text not null default 'Identificado',
    responsable text,
    creado_por uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    foreign key (proyecto_id, organizacion_id)
        references public.proyectos(id, organizacion_id) on delete cascade,
    unique (organizacion_id, codigo)
);

create table if not exists public.vulnerabilidades (
    id uuid primary key default gen_random_uuid(),
    organizacion_id uuid not null references public.organizaciones(id) on delete cascade,
    proyecto_id uuid,
    codigo text not null,
    nombre text not null,
    descripcion text,
    categoria text,
    severidad text not null default 'Media',
    activo_afectado text,
    estado text not null default 'Abierta',
    creado_por uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    foreign key (proyecto_id, organizacion_id)
        references public.proyectos(id, organizacion_id) on delete cascade,
    unique (organizacion_id, codigo)
);

create index if not exists asignaciones_usuario_estado_idx
    on public.asignaciones (usuario_id, estado);
create index if not exists asignaciones_equipo_estado_idx
    on public.asignaciones (equipo_id, estado);
create index if not exists revisiones_equipo_plazo_idx
    on public.revisiones (equipo_id, fecha_fin_plazo);
create index if not exists revision_eventos_revision_fecha_idx
    on public.revision_eventos (revision_id, fecha_hora desc);
create index if not exists evidencias_revision_created_idx
    on public.evidencias (revision_id, created_at desc);
create index if not exists auditoria_actor_fecha_idx
    on public.auditoria (actor_id, fecha_hora desc);
create index if not exists notificaciones_destinatario_fecha_idx
    on public.notificaciones (destinatario_id, created_at desc);
create index if not exists riesgos_org_created_idx
    on public.riesgos (organizacion_id, created_at desc);
create index if not exists vulnerabilidades_org_created_idx
    on public.vulnerabilidades (organizacion_id, created_at desc);

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
    select p.organizacion_id
    from public.profiles p
    where p.id = (select auth.uid())
$$;

create or replace function public.has_organization_role(
    target_organization_id uuid,
    allowed_levels text[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.asignaciones a
        join public.roles r on r.id = a.rol_id
        where a.usuario_id = (select auth.uid())
          and a.organizacion_id = target_organization_id
          and a.estado = 'activo'
          and r.estado = 'activo'
          and r.nivel = any (allowed_levels)
    )
$$;

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.profiles p
        where p.id = (select auth.uid())
          and p.organizacion_id = target_organization_id
          and p.estado = 'activo'
    )
$$;

create or replace function public.can_manage_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select public.has_organization_role(
               target_organization_id,
               array['superadmin', 'admin_organizacion']::text[]
           )
        or exists (
            select 1
            from public.organizaciones o
            where o.id = target_organization_id
              and o.creado_por = (select auth.uid())
              and not exists (
                  select 1
                  from public.asignaciones a
                  where a.usuario_id = (select auth.uid())
                    and a.organizacion_id = target_organization_id
                    and a.estado = 'activo'
              )
        )
$$;

create or replace function public.has_team_role(target_team_id uuid, allowed_levels text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.asignaciones a
        join public.roles r on r.id = a.rol_id
        where a.usuario_id = (select auth.uid())
          and a.equipo_id = target_team_id
          and a.estado = 'activo'
          and r.estado = 'activo'
          and r.nivel = any (allowed_levels)
    )
$$;

create or replace function public.can_access_team(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.equipos e
        where e.id = target_team_id
          and (
              public.has_organization_role(
                  e.organizacion_id,
                  array['superadmin', 'admin_organizacion']::text[]
              )
              or exists (
                  select 1
                  from public.asignaciones a
                  where a.usuario_id = (select auth.uid())
                    and a.equipo_id = e.id
                    and a.estado = 'activo'
              )
          )
    )
$$;

create or replace function public.can_manage_team(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.equipos e
        where e.id = target_team_id
          and (
              public.can_manage_organization(e.organizacion_id)
              or public.has_team_role(
                  e.id,
                  array['admin_equipo']::text[]
              )
          )
    )
$$;

create or replace function public.can_create_review(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select public.can_manage_team(target_team_id)
        or public.has_team_role(target_team_id, array['supervisor']::text[])
$$;

create or replace function public.can_read_profile(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select target_user_id = (select auth.uid())
        or exists (
            select 1
            from public.profiles target
            where target.id = target_user_id
              and (
                  public.has_organization_role(
                      target.organizacion_id,
                      array['superadmin', 'admin_organizacion']::text[]
                  )
                  or exists (
                      select 1
                      from public.asignaciones mine
                      join public.asignaciones theirs
                        on theirs.equipo_id = mine.equipo_id
                       and theirs.usuario_id = target.id
                       and theirs.estado = 'activo'
                      where mine.usuario_id = (select auth.uid())
                        and mine.estado = 'activo'
                  )
              )
        )
$$;

create or replace function public.can_read_review(target_review_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.revisiones r
        where r.id = target_review_id
          and public.can_access_team(r.equipo_id)
    )
$$;

create or replace function public.can_manage_review(target_review_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.revisiones r
        where r.id = target_review_id
          and public.can_create_review(r.equipo_id)
    )
$$;

create or replace function public.is_superadmin_for_actor(target_actor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.profiles p
        where p.id = target_actor_id
          and public.has_organization_role(
              p.organizacion_id,
              array['superadmin']::text[]
          )
    )
$$;

create or replace view public.revisiones_estado
with (security_invoker = true)
as
select
    r.*,
    case
        when r.cancelada then 'Cancelada'
        when r.fecha_fin_real is not null and r.fecha_fin_real <= r.fecha_fin_plazo
            then 'Finalizada en plazo'
        when r.fecha_fin_real is not null then 'Finalizada fuera de plazo'
        when now() > r.fecha_fin_plazo then 'Vencida'
        when r.fecha_inicio_real is not null then 'En proceso'
        else 'No iniciada'
    end as estado,
    case
        when r.fecha_fin_real is null then null
        when r.fecha_fin_real <= r.fecha_fin_plazo then 'En plazo'
        else 'Fuera de plazo'
    end as cumplimiento
from public.revisiones r;

alter table public.organizaciones enable row level security;
alter table public.profiles enable row level security;
alter table public.equipos enable row level security;
alter table public.cargos enable row level security;
alter table public.roles enable row level security;
alter table public.permisos enable row level security;
alter table public.roles_permisos enable row level security;
alter table public.asignaciones enable row level security;
alter table public.revisiones enable row level security;
alter table public.revision_eventos enable row level security;
alter table public.evidencias enable row level security;
alter table public.auditoria enable row level security;
alter table public.notificaciones enable row level security;
alter table public.proyectos enable row level security;
alter table public.riesgos enable row level security;
alter table public.vulnerabilidades enable row level security;

drop policy if exists organizaciones_select_miembro_o_invitado on public.organizaciones;
create policy organizaciones_select_miembro_o_invitado
    on public.organizaciones for select to authenticated
    using (
        id = (select public.current_organization_id())
        or creado_por = (select auth.uid())
        or codigo_invitacion = (
            select auth.jwt() -> 'user_metadata' ->> 'codigo_invitacion'
        )
    );

drop policy if exists organizaciones_insert_creador on public.organizaciones;
create policy organizaciones_insert_creador
    on public.organizaciones for insert to authenticated
    with check (creado_por = (select auth.uid()));

drop policy if exists organizaciones_update_admin on public.organizaciones;
create policy organizaciones_update_admin
    on public.organizaciones for update to authenticated
    using (public.can_manage_organization(id))
    with check (public.can_manage_organization(id));

drop policy if exists profiles_select_acceso on public.profiles;
create policy profiles_select_acceso
    on public.profiles for select to authenticated
    using (public.can_read_profile(id));

drop policy if exists profiles_insert_propio on public.profiles;
create policy profiles_insert_propio
    on public.profiles for insert to authenticated
    with check (
        id = (select auth.uid())
        and exists (
            select 1
            from public.organizaciones o
            where o.id = organizacion_id
              and (
                  o.creado_por = (select auth.uid())
                  or o.codigo_invitacion = (
                      select auth.jwt() -> 'user_metadata' ->> 'codigo_invitacion'
                  )
              )
        )
    );

drop policy if exists profiles_update_propio on public.profiles;
create policy profiles_update_propio
    on public.profiles for update to authenticated
    using (id = (select auth.uid()))
    with check (
        id = (select auth.uid())
        and organizacion_id = (select public.current_organization_id())
    );

drop policy if exists profiles_delete_propio on public.profiles;
create policy profiles_delete_propio
    on public.profiles for delete to authenticated
    using (id = (select auth.uid()));

drop policy if exists equipos_select_miembros on public.equipos;
create policy equipos_select_miembros
    on public.equipos for select to authenticated
    using (public.can_access_team(id));

drop policy if exists equipos_insert_admin on public.equipos;
create policy equipos_insert_admin
    on public.equipos for insert to authenticated
    with check (public.can_manage_organization(organizacion_id));

drop policy if exists equipos_update_admin on public.equipos;
create policy equipos_update_admin
    on public.equipos for update to authenticated
    using (public.can_manage_organization(organizacion_id))
    with check (public.can_manage_organization(organizacion_id));

drop policy if exists cargos_select_org on public.cargos;
create policy cargos_select_org
    on public.cargos for select to authenticated
    using (public.is_organization_member(organizacion_id));

drop policy if exists cargos_insert_admin on public.cargos;
create policy cargos_insert_admin
    on public.cargos for insert to authenticated
    with check (public.can_manage_organization(organizacion_id));

drop policy if exists roles_select_org on public.roles;
create policy roles_select_org
    on public.roles for select to authenticated
    using (public.is_organization_member(organizacion_id));

drop policy if exists roles_insert_admin on public.roles;
create policy roles_insert_admin
    on public.roles for insert to authenticated
    with check (
        public.can_manage_organization(organizacion_id)
        and (nivel <> 'superadmin'
             or public.has_organization_role(organizacion_id, array['superadmin']::text[]))
    );

drop policy if exists roles_update_admin on public.roles;
create policy roles_update_admin
    on public.roles for update to authenticated
    using (public.can_manage_organization(organizacion_id))
    with check (
        public.can_manage_organization(organizacion_id)
        and (nivel <> 'superadmin'
             or public.has_organization_role(organizacion_id, array['superadmin']::text[]))
    );

drop policy if exists permisos_select_authenticated on public.permisos;
create policy permisos_select_authenticated
    on public.permisos for select to authenticated
    using (true);

drop policy if exists roles_permisos_select_org on public.roles_permisos;
create policy roles_permisos_select_org
    on public.roles_permisos for select to authenticated
    using (
        exists (
            select 1
            from public.roles r
            where r.id = rol_id
              and public.is_organization_member(r.organizacion_id)
        )
    );

drop policy if exists roles_permisos_admin on public.roles_permisos;
create policy roles_permisos_admin
    on public.roles_permisos for all to authenticated
    using (
        exists (
            select 1
            from public.roles r
            where r.id = rol_id
              and public.can_manage_organization(r.organizacion_id)
        )
    )
    with check (
        exists (
            select 1
            from public.roles r
            where r.id = rol_id
              and public.can_manage_organization(r.organizacion_id)
        )
    );

drop policy if exists asignaciones_select_acceso on public.asignaciones;
create policy asignaciones_select_acceso
    on public.asignaciones for select to authenticated
    using (
        usuario_id = (select auth.uid())
        or public.can_manage_team(equipo_id)
    );

drop policy if exists asignaciones_insert_admin on public.asignaciones;
create policy asignaciones_insert_admin
    on public.asignaciones for insert to authenticated
    with check (
        (
            public.has_organization_role(
                organizacion_id,
                array['superadmin', 'admin_organizacion']::text[]
            )
            and (
                (select nivel from public.roles where id = rol_id) <> 'superadmin'
                or public.has_organization_role(
                    organizacion_id,
                    array['superadmin']::text[]
                )
            )
        )
        or (
            public.has_team_role(equipo_id, array['admin_equipo']::text[])
            and (select nivel from public.roles where id = rol_id)
                not in ('superadmin', 'admin_organizacion')
        )
        or (
            usuario_id = (select auth.uid())
            and (select nivel from public.roles where id = rol_id) = 'admin_organizacion'
            and exists (
                select 1
                from public.organizaciones o
                where o.id = organizacion_id
                  and o.creado_por = (select auth.uid())
            )
            and not exists (
                select 1
                from public.asignaciones own
                where own.usuario_id = (select auth.uid())
                  and own.organizacion_id = asignaciones.organizacion_id
                  and own.estado = 'activo'
            )
        )
    );

drop policy if exists asignaciones_update_admin on public.asignaciones;
create policy asignaciones_update_admin
    on public.asignaciones for update to authenticated
    using (
        public.has_organization_role(
            organizacion_id,
            array['superadmin', 'admin_organizacion']::text[]
        )
        or (
            public.has_team_role(equipo_id, array['admin_equipo']::text[])
            and rol_id in (
                select r.id from public.roles r
                where r.nivel not in ('superadmin', 'admin_organizacion')
            )
        )
    )
    with check (
        public.has_organization_role(
            organizacion_id,
            array['superadmin', 'admin_organizacion']::text[]
        )
        or (
            public.has_team_role(equipo_id, array['admin_equipo']::text[])
            and rol_id in (
                select r.id from public.roles r
                where r.nivel not in ('superadmin', 'admin_organizacion')
            )
        )
    );

drop policy if exists asignaciones_delete_propio on public.asignaciones;
create policy asignaciones_delete_propio
    on public.asignaciones for delete to authenticated
    using (usuario_id = (select auth.uid()));

drop policy if exists revisiones_select_equipo on public.revisiones;
create policy revisiones_select_equipo
    on public.revisiones for select to authenticated
    using (public.can_access_team(equipo_id));

drop policy if exists revisiones_insert_equipo on public.revisiones;
create policy revisiones_insert_equipo
    on public.revisiones for insert to authenticated
    with check (
        creado_por = (select auth.uid())
        and public.can_create_review(equipo_id)
        and exists (
            select 1
            from public.asignaciones a
            where a.usuario_id = revisiones.responsable_id
              and a.equipo_id = revisiones.equipo_id
              and a.estado = 'activo'
        )
    );

drop policy if exists revisiones_update_responsable_o_admin on public.revisiones;
create policy revisiones_update_responsable_o_admin
    on public.revisiones for update to authenticated
    using (
        public.can_manage_review(id)
        or responsable_id = (select auth.uid())
    )
    with check (
        public.can_manage_review(id)
        or responsable_id = (select auth.uid())
    );

drop policy if exists revision_eventos_select_equipo on public.revision_eventos;
create policy revision_eventos_select_equipo
    on public.revision_eventos for select to authenticated
    using (public.can_read_review(revision_id));

drop policy if exists revision_eventos_insert_actor on public.revision_eventos;
create policy revision_eventos_insert_actor
    on public.revision_eventos for insert to authenticated
    with check (
        actor_id = (select auth.uid())
        and public.can_read_review(revision_id)
    );

drop policy if exists evidencias_select_equipo on public.evidencias;
create policy evidencias_select_equipo
    on public.evidencias for select to authenticated
    using (public.can_read_review(revision_id));

drop policy if exists evidencias_insert_miembro on public.evidencias;
create policy evidencias_insert_miembro
    on public.evidencias for insert to authenticated
    with check (
        subido_por = (select auth.uid())
        and public.can_read_review(revision_id)
    );

drop policy if exists auditoria_select_propias_o_superadmin on public.auditoria;
create policy auditoria_select_propias_o_superadmin
    on public.auditoria for select to authenticated
    using (
        actor_id = (select auth.uid())
        or public.is_superadmin_for_actor(actor_id)
    );

drop policy if exists auditoria_insert_propias on public.auditoria;
create policy auditoria_insert_propias
    on public.auditoria for insert to authenticated
    with check (actor_id = (select auth.uid()));

drop policy if exists notificaciones_select_destinatario on public.notificaciones;
create policy notificaciones_select_destinatario
    on public.notificaciones for select to authenticated
    using (destinatario_id = (select auth.uid()));

drop policy if exists notificaciones_insert_miembro on public.notificaciones;
create policy notificaciones_insert_miembro
    on public.notificaciones for insert to authenticated
    with check (
        creado_por = (select auth.uid())
        and exists (
            select 1
            from public.profiles destinatario
            where destinatario.id = destinatario_id
              and destinatario.organizacion_id = (select public.current_organization_id())
        )
        and (revision_id is null or public.can_read_review(revision_id))
    );

drop policy if exists notificaciones_update_destinatario on public.notificaciones;
create policy notificaciones_update_destinatario
    on public.notificaciones for update to authenticated
    using (destinatario_id = (select auth.uid()))
    with check (destinatario_id = (select auth.uid()));

drop policy if exists proyectos_select_org on public.proyectos;
create policy proyectos_select_org
    on public.proyectos for select to authenticated
    using (public.is_organization_member(organizacion_id));

drop policy if exists proyectos_insert_org on public.proyectos;
create policy proyectos_insert_org
    on public.proyectos for insert to authenticated
    with check (
        creado_por = (select auth.uid())
        and public.is_organization_member(organizacion_id)
    );

drop policy if exists riesgos_select_org on public.riesgos;
create policy riesgos_select_org
    on public.riesgos for select to authenticated
    using (public.is_organization_member(organizacion_id));

drop policy if exists riesgos_insert_org on public.riesgos;
create policy riesgos_insert_org
    on public.riesgos for insert to authenticated
    with check (
        creado_por = (select auth.uid())
        and public.is_organization_member(organizacion_id)
    );

drop policy if exists riesgos_update_org on public.riesgos;
create policy riesgos_update_org
    on public.riesgos for update to authenticated
    using (public.is_organization_member(organizacion_id))
    with check (public.is_organization_member(organizacion_id));

drop policy if exists vulnerabilidades_select_org on public.vulnerabilidades;
create policy vulnerabilidades_select_org
    on public.vulnerabilidades for select to authenticated
    using (public.is_organization_member(organizacion_id));

drop policy if exists vulnerabilidades_insert_org on public.vulnerabilidades;
create policy vulnerabilidades_insert_org
    on public.vulnerabilidades for insert to authenticated
    with check (
        creado_por = (select auth.uid())
        and public.is_organization_member(organizacion_id)
    );

drop policy if exists vulnerabilidades_update_org on public.vulnerabilidades;
create policy vulnerabilidades_update_org
    on public.vulnerabilidades for update to authenticated
    using (public.is_organization_member(organizacion_id))
    with check (public.is_organization_member(organizacion_id));

revoke all on function public.current_organization_id() from public;
revoke all on function public.has_organization_role(uuid, text[]) from public;
revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.can_manage_organization(uuid) from public;
revoke all on function public.has_team_role(uuid, text[]) from public;
revoke all on function public.can_access_team(uuid) from public;
revoke all on function public.can_manage_team(uuid) from public;
revoke all on function public.can_create_review(uuid) from public;
revoke all on function public.can_read_profile(uuid) from public;
revoke all on function public.can_read_review(uuid) from public;
revoke all on function public.can_manage_review(uuid) from public;
revoke all on function public.is_superadmin_for_actor(uuid) from public;

grant execute on function public.current_organization_id() to authenticated;
grant execute on function public.has_organization_role(uuid, text[]) to authenticated;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.can_manage_organization(uuid) to authenticated;
grant execute on function public.has_team_role(uuid, text[]) to authenticated;
grant execute on function public.can_access_team(uuid) to authenticated;
grant execute on function public.can_manage_team(uuid) to authenticated;
grant execute on function public.can_create_review(uuid) to authenticated;
grant execute on function public.can_read_profile(uuid) to authenticated;
grant execute on function public.can_read_review(uuid) to authenticated;
grant execute on function public.can_manage_review(uuid) to authenticated;
grant execute on function public.is_superadmin_for_actor(uuid) to authenticated;

grant select, insert, update on public.organizaciones to authenticated;
grant select, insert, delete on public.profiles to authenticated;
grant select, insert, update on public.equipos to authenticated;
grant select, insert on public.cargos to authenticated;
grant select, insert, update on public.roles to authenticated;
grant select on public.permisos to authenticated;
grant select, insert, update, delete on public.roles_permisos to authenticated;
grant select, insert, update, delete on public.asignaciones to authenticated;
grant select, insert on public.revisiones to authenticated;
grant select, insert on public.revision_eventos to authenticated;
grant select, insert on public.evidencias to authenticated;
grant select, insert on public.auditoria to authenticated;
grant select, insert on public.notificaciones to authenticated;
grant select, insert on public.proyectos to authenticated;
grant select, insert, update on public.riesgos to authenticated;
grant select, insert, update on public.vulnerabilidades to authenticated;
grant select on public.revisiones_estado to authenticated;
grant update (nombre, apellido, email, zona_horaria)
    on public.profiles to authenticated;
grant update (estado, leida_at) on public.notificaciones to authenticated;
grant update (fecha_inicio_real, fecha_fin_real, cancelada)
    on public.revisiones to authenticated;

insert into storage.buckets (id, name, public)
values
    ('aerion-assets', 'aerion-assets', true),
    ('aerion-evidencias', 'aerion-evidencias', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists aerion_assets_public_read on storage.objects;
create policy aerion_assets_public_read
    on storage.objects for select to anon, authenticated
    using (bucket_id = 'aerion-assets');

drop policy if exists aerion_assets_org_upload on storage.objects;
create policy aerion_assets_org_upload
    on storage.objects for insert to authenticated
    with check (
        bucket_id = 'aerion-assets'
        and (storage.foldername(name))[1] = 'proyectos'
        and (storage.foldername(name))[2] = (select public.current_organization_id())::text
    );

drop policy if exists aerion_assets_org_update on storage.objects;
create policy aerion_assets_org_update
    on storage.objects for update to authenticated
    using (
        bucket_id = 'aerion-assets'
        and (storage.foldername(name))[1] = 'proyectos'
        and (storage.foldername(name))[2] = (select public.current_organization_id())::text
    )
    with check (
        bucket_id = 'aerion-assets'
        and (storage.foldername(name))[1] = 'proyectos'
        and (storage.foldername(name))[2] = (select public.current_organization_id())::text
    );

drop policy if exists aerion_evidencias_read_accessible on storage.objects;
create policy aerion_evidencias_read_accessible
    on storage.objects for select to authenticated
    using (
        bucket_id = 'aerion-evidencias'
        and (
            (storage.foldername(name))[1] = (select auth.uid())::text
            or exists (
                select 1
                from public.revisiones r
                where r.id::text = (storage.foldername(name))[1]
                  and public.can_access_team(r.equipo_id)
            )
        )
    );

drop policy if exists aerion_evidencias_upload_accessible on storage.objects;
create policy aerion_evidencias_upload_accessible
    on storage.objects for insert to authenticated
    with check (
        bucket_id = 'aerion-evidencias'
        and (
            (storage.foldername(name))[1] = (select auth.uid())::text
            or exists (
                select 1
                from public.revisiones r
                where r.id::text = (storage.foldername(name))[1]
                  and public.can_access_team(r.equipo_id)
            )
        )
    );

drop policy if exists aerion_evidencias_remove_own_upload on storage.objects;
create policy aerion_evidencias_remove_own_upload
    on storage.objects for delete to authenticated
    using (
        bucket_id = 'aerion-evidencias'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

commit;
