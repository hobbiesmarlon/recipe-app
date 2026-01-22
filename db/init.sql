--
-- PostgreSQL database dump
--

\restrict MRpMq7YZKJAlLheUrkDSy3cLbP7d862ZP98vAva73QuXyMCRNslEmSS8Erj6fHK

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: oauth_provider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.oauth_provider AS ENUM (
    'x',
    'google',
    'local',
    'other'
);


ALTER TYPE public.oauth_provider OWNER TO postgres;

--
-- Name: unit_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.unit_type AS ENUM (
    'weight',
    'volume',
    'count',
    'other'
);


ALTER TYPE public.unit_type OWNER TO postgres;

--
-- Name: refresh_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.refresh_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.refresh_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    group_id bigint NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: category_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category_groups (
    id bigint NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.category_groups OWNER TO postgres;

--
-- Name: category_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.category_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.category_groups_id_seq OWNER TO postgres;

--
-- Name: category_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.category_groups_id_seq OWNED BY public.category_groups.id;


--
-- Name: ingredient_aliases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredient_aliases (
    alias_text text NOT NULL,
    canonical_ingredient_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ingredient_aliases OWNER TO postgres;

--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredients (
    id bigint NOT NULL,
    name text NOT NULL,
    base_ingredient_id bigint,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ingredients OWNER TO postgres;

--
-- Name: ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredients_id_seq OWNER TO postgres;

--
-- Name: ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredients_id_seq OWNED BY public.ingredients.id;


--
-- Name: oauth_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oauth_accounts (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    provider public.oauth_provider NOT NULL,
    provider_user_id text NOT NULL,
    provider_username text,
    provider_display_name text,
    provider_profile_pic_url text,
    access_token text,
    refresh_token text,
    token_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.oauth_accounts OWNER TO postgres;

--
-- Name: oauth_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.oauth_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.oauth_accounts_id_seq OWNER TO postgres;

--
-- Name: oauth_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.oauth_accounts_id_seq OWNED BY public.oauth_accounts.id;


--
-- Name: recipe_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_categories (
    recipe_id bigint NOT NULL,
    category_id bigint NOT NULL
);


ALTER TABLE public.recipe_categories OWNER TO postgres;

--
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_ingredients (
    id bigint NOT NULL,
    recipe_id bigint NOT NULL,
    ingredient_id bigint,
    name_text text NOT NULL,
    quantity numeric(12,4),
    unit_id bigint,
    quantity_text text,
    preparation_notes text,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recipe_ingredients OWNER TO postgres;

--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipe_ingredients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipe_ingredients_id_seq OWNER TO postgres;

--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipe_ingredients_id_seq OWNED BY public.recipe_ingredients.id;


--
-- Name: recipe_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_photos (
    id bigint NOT NULL,
    recipe_id bigint NOT NULL,
    url text NOT NULL,
    alt_text text,
    is_primary boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recipe_photos OWNER TO postgres;

--
-- Name: recipe_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipe_photos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipe_photos_id_seq OWNER TO postgres;

--
-- Name: recipe_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipe_photos_id_seq OWNED BY public.recipe_photos.id;


--
-- Name: recipe_steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_steps (
    id bigint NOT NULL,
    recipe_id bigint NOT NULL,
    step_number integer NOT NULL,
    instruction text NOT NULL,
    estimated_minutes integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recipe_steps OWNER TO postgres;

--
-- Name: recipe_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipe_steps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipe_steps_id_seq OWNER TO postgres;

--
-- Name: recipe_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipe_steps_id_seq OWNED BY public.recipe_steps.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipes (
    id bigint NOT NULL,
    user_id bigint,
    name text NOT NULL,
    description text,
    cook_time_minutes integer,
    servings integer,
    is_public boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recipes OWNER TO postgres;

--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipes_id_seq OWNER TO postgres;

--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    id bigint NOT NULL,
    name text NOT NULL,
    symbol text,
    unit_type public.unit_type DEFAULT 'other'::public.unit_type NOT NULL,
    conversion_to_base double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.units OWNER TO postgres;

--
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.units_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.units_id_seq OWNER TO postgres;

--
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;


--
-- Name: user_recipe_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_recipe_views (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    recipe_id bigint NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_recipe_views OWNER TO postgres;

--
-- Name: user_recipe_views_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_recipe_views_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_recipe_views_id_seq OWNER TO postgres;

--
-- Name: user_recipe_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_recipe_views_id_seq OWNED BY public.user_recipe_views.id;


--
-- Name: user_saved_recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_saved_recipes (
    user_id bigint NOT NULL,
    recipe_id bigint NOT NULL,
    saved_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_saved_recipes OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username text NOT NULL,
    display_name text NOT NULL,
    email text,
    profile_picture_url text,
    username_sourced_from_provider boolean DEFAULT false NOT NULL,
    display_name_sourced_from_provider boolean DEFAULT false NOT NULL,
    profile_pic_sourced_from_provider boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: category_groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_groups ALTER COLUMN id SET DEFAULT nextval('public.category_groups_id_seq'::regclass);


--
-- Name: ingredients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN id SET DEFAULT nextval('public.ingredients_id_seq'::regclass);


--
-- Name: oauth_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_accounts ALTER COLUMN id SET DEFAULT nextval('public.oauth_accounts_id_seq'::regclass);


--
-- Name: recipe_ingredients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients ALTER COLUMN id SET DEFAULT nextval('public.recipe_ingredients_id_seq'::regclass);


--
-- Name: recipe_photos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_photos ALTER COLUMN id SET DEFAULT nextval('public.recipe_photos_id_seq'::regclass);


--
-- Name: recipe_steps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_steps ALTER COLUMN id SET DEFAULT nextval('public.recipe_steps_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: units id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- Name: user_recipe_views id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_recipe_views ALTER COLUMN id SET DEFAULT nextval('public.user_recipe_views_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, group_id, name, description, created_at) FROM stdin;
1	1	Breakfast	\N	2025-12-08 15:47:50.322387+03
2	1	Lunch	\N	2025-12-08 15:47:50.322387+03
3	1	Dinner	\N	2025-12-08 15:47:50.322387+03
4	1	Snack	\N	2025-12-08 15:47:50.322387+03
5	1	Appetizer	\N	2025-12-08 15:47:50.322387+03
6	1	Dessert	\N	2025-12-08 15:47:50.322387+03
7	1	Sauce	\N	2025-12-08 15:47:50.322387+03
8	2	Bake	\N	2025-12-08 15:47:50.341089+03
9	2	Fry	\N	2025-12-08 15:47:50.341089+03
10	2	Grill	\N	2025-12-08 15:47:50.341089+03
11	2	Roast	\N	2025-12-08 15:47:50.341089+03
12	2	Slow Cook	\N	2025-12-08 15:47:50.341089+03
13	2	No-Cook	\N	2025-12-08 15:47:50.341089+03
14	3	Vegetarian	\N	2025-12-08 15:47:50.352021+03
15	3	Vegan	\N	2025-12-08 15:47:50.352021+03
16	3	Gluten-Free	\N	2025-12-08 15:47:50.352021+03
17	3	Dairy-Free	\N	2025-12-08 15:47:50.352021+03
18	3	Low-Carb	\N	2025-12-08 15:47:50.352021+03
19	4	Sweet	\N	2025-12-08 15:47:50.361563+03
20	4	Savory	\N	2025-12-08 15:47:50.361563+03
21	4	Spicy	\N	2025-12-08 15:47:50.361563+03
22	4	Sour	\N	2025-12-08 15:47:50.361563+03
23	4	Bitter	\N	2025-12-08 15:47:50.361563+03
24	5	Budget Friendly	\N	2025-12-08 15:47:50.369346+03
25	5	Beginner Friendly	\N	2025-12-08 15:47:50.369346+03
26	5	Low Effort	\N	2025-12-08 15:47:50.369346+03
27	5	30 Minutes or Less	\N	2025-12-08 15:47:50.369346+03
28	6	Cocktail	\N	2025-12-08 15:47:50.379773+03
29	6	Mocktail	\N	2025-12-08 15:47:50.379773+03
30	6	Coffee/Tea	\N	2025-12-08 15:47:50.379773+03
31	6	Juice	\N	2025-12-08 15:47:50.379773+03
32	6	Milkshake	\N	2025-12-08 15:47:50.379773+03
33	6	Smoothie	\N	2025-12-08 15:47:50.379773+03
\.


--
-- Data for Name: category_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category_groups (id, name, description, created_at) FROM stdin;
1	Meal Type	Meal categories such as Breakfast, Lunch, Dinner	2025-12-08 15:47:50.308015+03
2	Cooking Method	Primary cooking technique	2025-12-08 15:47:50.308015+03
3	Dietary	Dietary restrictions / preferences	2025-12-08 15:47:50.308015+03
4	Flavour	Dominant flavour profile	2025-12-08 15:47:50.308015+03
5	Budget and Ease	Budget and effort indicators	2025-12-08 15:47:50.308015+03
6	Drinks	Beverage categories	2025-12-08 15:47:50.308015+03
\.


--
-- Data for Name: ingredient_aliases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_aliases (alias_text, canonical_ingredient_id, created_at) FROM stdin;
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredients (id, name, base_ingredient_id, description, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oauth_accounts (id, user_id, provider, provider_user_id, provider_username, provider_display_name, provider_profile_pic_url, access_token, refresh_token, token_expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: recipe_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recipe_categories (recipe_id, category_id) FROM stdin;
\.


--
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recipe_ingredients (id, recipe_id, ingredient_id, name_text, quantity, unit_id, quantity_text, preparation_notes, display_order, created_at) FROM stdin;
\.


--
-- Data for Name: recipe_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recipe_photos (id, recipe_id, url, alt_text, is_primary, display_order, uploaded_at) FROM stdin;
\.


--
-- Data for Name: recipe_steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recipe_steps (id, recipe_id, step_number, instruction, estimated_minutes, created_at) FROM stdin;
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recipes (id, user_id, name, description, cook_time_minutes, servings, is_public, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (id, name, symbol, unit_type, conversion_to_base, created_at) FROM stdin;
1	gram	g	weight	1	2025-12-08 15:47:50.095651+03
2	kilogram	kg	weight	1000	2025-12-08 15:47:50.095651+03
3	milliliter	ml	volume	1	2025-12-08 15:47:50.095651+03
4	liter	l	volume	1000	2025-12-08 15:47:50.095651+03
5	cup	cup	volume	240	2025-12-08 15:47:50.095651+03
6	tablespoon	tbsp	volume	15	2025-12-08 15:47:50.095651+03
7	teaspoon	tsp	volume	5	2025-12-08 15:47:50.095651+03
8	piece	pc	count	1	2025-12-08 15:47:50.095651+03
\.


--
-- Data for Name: user_recipe_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_recipe_views (id, user_id, recipe_id, viewed_at) FROM stdin;
\.


--
-- Data for Name: user_saved_recipes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_saved_recipes (user_id, recipe_id, saved_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, display_name, email, profile_picture_url, username_sourced_from_provider, display_name_sourced_from_provider, profile_pic_sourced_from_provider, created_at, updated_at) FROM stdin;
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 33, true);


--
-- Name: category_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.category_groups_id_seq', 6, true);


--
-- Name: ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredients_id_seq', 1, false);


--
-- Name: oauth_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.oauth_accounts_id_seq', 1, false);


--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recipe_ingredients_id_seq', 1, false);


--
-- Name: recipe_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recipe_photos_id_seq', 1, false);


--
-- Name: recipe_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recipe_steps_id_seq', 1, false);


--
-- Name: recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recipes_id_seq', 1, false);


--
-- Name: units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.units_id_seq', 8, true);


--
-- Name: user_recipe_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_recipe_views_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: category_groups category_groups_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_groups
    ADD CONSTRAINT category_groups_name_key UNIQUE (name);


--
-- Name: category_groups category_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_groups
    ADD CONSTRAINT category_groups_pkey PRIMARY KEY (id);


--
-- Name: ingredient_aliases ingredient_aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_aliases
    ADD CONSTRAINT ingredient_aliases_pkey PRIMARY KEY (alias_text);


--
-- Name: ingredients ingredients_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_name_key UNIQUE (name);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: oauth_accounts oauth_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_pkey PRIMARY KEY (id);


--
-- Name: recipe_categories recipe_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_categories
    ADD CONSTRAINT recipe_categories_pkey PRIMARY KEY (recipe_id, category_id);


--
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id);


--
-- Name: recipe_photos recipe_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_photos
    ADD CONSTRAINT recipe_photos_pkey PRIMARY KEY (id);


--
-- Name: recipe_steps recipe_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_steps
    ADD CONSTRAINT recipe_steps_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: units units_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_name_key UNIQUE (name);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: categories uq_category_group_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT uq_category_group_name UNIQUE (group_id, name);


--
-- Name: oauth_accounts uq_oauth_provider_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT uq_oauth_provider_user UNIQUE (provider, provider_user_id);


--
-- Name: recipe_steps uq_recipe_step; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_steps
    ADD CONSTRAINT uq_recipe_step UNIQUE (recipe_id, step_number);


--
-- Name: user_recipe_views user_recipe_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_recipe_views
    ADD CONSTRAINT user_recipe_views_pkey PRIMARY KEY (id);


--
-- Name: user_saved_recipes user_saved_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_saved_recipes
    ADD CONSTRAINT user_saved_recipes_pkey PRIMARY KEY (user_id, recipe_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_aliases_canonical; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_aliases_canonical ON public.ingredient_aliases USING btree (canonical_ingredient_id);


--
-- Name: idx_categories_group; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_group ON public.categories USING btree (group_id);


--
-- Name: idx_ingredient_alias_lower; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ingredient_alias_lower ON public.ingredient_aliases USING btree (lower(alias_text));


--
-- Name: idx_ingredient_name_lower; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ingredient_name_lower ON public.ingredients USING btree (lower(name));


--
-- Name: idx_ingredients_base; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ingredients_base ON public.ingredients USING btree (base_ingredient_id);


--
-- Name: idx_oauth_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_oauth_userid ON public.oauth_accounts USING btree (user_id);


--
-- Name: idx_recipe_categories_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recipe_categories_category ON public.recipe_categories USING btree (category_id);


--
-- Name: idx_recipe_ingredients_ing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recipe_ingredients_ing ON public.recipe_ingredients USING btree (ingredient_id);


--
-- Name: idx_recipe_ingredients_recipe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recipe_ingredients_recipe ON public.recipe_ingredients USING btree (recipe_id);


--
-- Name: idx_recipe_photos_recipe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recipe_photos_recipe ON public.recipe_photos USING btree (recipe_id);


--
-- Name: idx_recipe_steps_recipe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recipe_steps_recipe ON public.recipe_steps USING btree (recipe_id);


--
-- Name: idx_recipes_is_public; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recipes_is_public ON public.recipes USING btree (is_public);


--
-- Name: idx_recipes_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recipes_name ON public.recipes USING btree (name);


--
-- Name: idx_recipes_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recipes_user ON public.recipes USING btree (user_id);


--
-- Name: idx_saved_recipes_recipe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_recipes_recipe ON public.user_saved_recipes USING btree (recipe_id);


--
-- Name: idx_views_recipe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_views_recipe ON public.user_recipe_views USING btree (recipe_id);


--
-- Name: idx_views_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_views_user ON public.user_recipe_views USING btree (user_id);


--
-- Name: oauth_accounts trg_oauth_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_oauth_accounts_updated_at BEFORE UPDATE ON public.oauth_accounts FOR EACH ROW EXECUTE FUNCTION public.refresh_updated_at_column();


--
-- Name: recipes trg_recipes_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.refresh_updated_at_column();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.refresh_updated_at_column();


--
-- Name: categories categories_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.category_groups(id) ON DELETE CASCADE;


--
-- Name: ingredient_aliases ingredient_aliases_canonical_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_aliases
    ADD CONSTRAINT ingredient_aliases_canonical_ingredient_id_fkey FOREIGN KEY (canonical_ingredient_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;


--
-- Name: ingredients ingredients_base_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_base_ingredient_id_fkey FOREIGN KEY (base_ingredient_id) REFERENCES public.ingredients(id) ON DELETE SET NULL;


--
-- Name: oauth_accounts oauth_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recipe_categories recipe_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_categories
    ADD CONSTRAINT recipe_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: recipe_categories recipe_categories_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_categories
    ADD CONSTRAINT recipe_categories_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_ingredients recipe_ingredients_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE SET NULL;


--
-- Name: recipe_ingredients recipe_ingredients_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_ingredients recipe_ingredients_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE SET NULL;


--
-- Name: recipe_photos recipe_photos_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_photos
    ADD CONSTRAINT recipe_photos_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_steps recipe_steps_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_steps
    ADD CONSTRAINT recipe_steps_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipes recipes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_recipe_views user_recipe_views_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_recipe_views
    ADD CONSTRAINT user_recipe_views_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: user_recipe_views user_recipe_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_recipe_views
    ADD CONSTRAINT user_recipe_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_saved_recipes user_saved_recipes_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_saved_recipes
    ADD CONSTRAINT user_saved_recipes_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: user_saved_recipes user_saved_recipes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_saved_recipes
    ADD CONSTRAINT user_saved_recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict MRpMq7YZKJAlLheUrkDSy3cLbP7d862ZP98vAva73QuXyMCRNslEmSS8Erj6fHK

