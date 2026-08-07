const SUPABASE_URL = "https://bkhqbzegquykosrpbfnt.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
