import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hhjumspyhnidfvwvxdbi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoanVtc3B5aG5pZGZ2d3Z4ZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNTg4MTAsImV4cCI6MjEwMDkzNDgxMH0.4EUeLWXApXKin9Lh77OgQ30_78_K6HLRKDlv-ZNBwZQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
