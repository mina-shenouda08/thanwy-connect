-- roles
CREATE TYPE public.app_role AS ENUM ('student','servant');

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade_level text NOT NULL CHECK (grade_level IN ('first','second','third')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT SELECT ON public.classes TO anon;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  grade_level text CHECK (grade_level IN ('first','second','third')),
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.my_grade()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT grade_level FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.grade_of(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT grade_level FROM public.users WHERE id = _user_id;
$$;

-- servant supervises a student when they are a servant of the same grade
CREATE OR REPLACE FUNCTION public.supervises(_student uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'servant')
     AND public.grade_of(_student) IS NOT DISTINCT FROM public.my_grade();
$$;

CREATE POLICY "classes readable" ON public.classes FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "servants manage classes" ON public.classes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'servant'));
CREATE POLICY "servants update classes" ON public.classes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'servant'));

CREATE POLICY "own profile insert" ON public.users FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.users FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profile read" ON public.users FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'servant'));

CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own roles insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'sunday_school',
  event_date date NOT NULL,
  start_time time,
  end_time time,
  location text,
  grade_level text,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','cancelled')),
  recurrence text NOT NULL DEFAULT 'once',
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events readable" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "servants insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'servant'));
CREATE POLICY "servants update events" ON public.events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'servant'));

-- attendance
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  present boolean NOT NULL DEFAULT true,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  UNIQUE (event_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance read" ON public.attendance FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.supervises(student_id));
CREATE POLICY "servants insert attendance" ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'servant'));
CREATE POLICY "servants update attendance" ON public.attendance FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'servant'));

-- spiritual journal: kind='prayers' (one row per day) or kind='reading'
CREATE TABLE public.spiritual_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  kind text NOT NULL DEFAULT 'prayers' CHECK (kind IN ('prayers','reading')),
  prayers jsonb NOT NULL DEFAULT '{}'::jsonb,
  testament text CHECK (testament IN ('old','new')),
  book text,
  chapter int,
  reflection text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX spiritual_journal_prayers_day ON public.spiritual_journal (student_id, entry_date) WHERE kind = 'prayers';
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spiritual_journal TO authenticated;
GRANT ALL ON public.spiritual_journal TO service_role;
ALTER TABLE public.spiritual_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journal read" ON public.spiritual_journal FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.supervises(student_id));
CREATE POLICY "journal insert own" ON public.spiritual_journal FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND entry_date = CURRENT_DATE);
CREATE POLICY "journal update own today" ON public.spiritual_journal FOR UPDATE TO authenticated
  USING (student_id = auth.uid() AND entry_date = CURRENT_DATE);

-- followup notes
CREATE TABLE public.followup_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  servant_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.followup_notes TO authenticated;
GRANT ALL ON public.followup_notes TO service_role;
ALTER TABLE public.followup_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "servants read notes" ON public.followup_notes FOR SELECT TO authenticated
  USING (public.supervises(student_id));
CREATE POLICY "servants write notes" ON public.followup_notes FOR INSERT TO authenticated
  WITH CHECK (servant_id = auth.uid() AND public.supervises(student_id));
CREATE POLICY "servants edit notes" ON public.followup_notes FOR UPDATE TO authenticated
  USING (servant_id = auth.uid());

-- book study
CREATE TABLE public.book_study_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  testament text NOT NULL CHECK (testament IN ('old','new')),
  book text NOT NULL,
  chapter int NOT NULL,
  due_date date NOT NULL,
  grade_level text,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_study_assignments TO authenticated;
GRANT ALL ON public.book_study_assignments TO service_role;
ALTER TABLE public.book_study_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments read" ON public.book_study_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "servants insert assignments" ON public.book_study_assignments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'servant'));
CREATE POLICY "servants update assignments" ON public.book_study_assignments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'servant'));

CREATE TABLE public.book_study_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.book_study_assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  answer_text text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_study_submissions TO authenticated;
GRANT ALL ON public.book_study_submissions TO service_role;
ALTER TABLE public.book_study_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "submissions read" ON public.book_study_submissions FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.supervises(student_id));
CREATE POLICY "submissions insert own" ON public.book_study_submissions FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "submissions update own" ON public.book_study_submissions FOR UPDATE TO authenticated
  USING (student_id = auth.uid());

INSERT INTO public.classes (name, grade_level) VALUES
  ('القديس بوليكاربوس','third'),
  ('القديس أثناسيوس','third'),
  ('القديس مارمينا','second'),
  ('القديس مار جرجس','second'),
  ('القديس أنطونيوس','first'),
  ('القديسة دميانة','first');