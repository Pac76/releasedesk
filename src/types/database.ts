export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          owner_id: string;
          target_date: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          target_date?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          target_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      work_items: {
        Row: {
          created_at: string;
          description: string | null;
          due_date: string | null;
          id: string;
          owner_id: string;
          priority: "low" | "medium" | "high";
          project_id: string;
          status: "backlog" | "in_progress" | "review" | "ready";
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          owner_id: string;
          priority?: "low" | "medium" | "high";
          project_id: string;
          status?: "backlog" | "in_progress" | "review" | "ready";
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          owner_id?: string;
          priority?: "low" | "medium" | "high";
          project_id?: string;
          status?: "backlog" | "in_progress" | "review" | "ready";
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_items_project_owner_fkey";
            columns: ["project_id", "owner_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id", "owner_id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

