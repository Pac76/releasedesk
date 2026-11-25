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
          repository_full_name: string | null;
          target_date: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          repository_full_name?: string | null;
          target_date?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          repository_full_name?: string | null;
          target_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      repository_snapshots: {
        Row: {
          captured_at: string;
          default_branch: string;
          head_committed_at: string;
          head_sha: string;
          id: string;
          open_issues: number;
          open_pull_requests: number;
          owner_id: string;
          project_id: string;
          repository_full_name: string;
          workflow_status: "success" | "failure" | "pending" | "cancelled" | "neutral" | "skipped" | "timed_out" | "action_required" | "stale" | "startup_failure" | "unknown" | "not_configured";
        };
        Insert: {
          captured_at?: string;
          default_branch: string;
          head_committed_at: string;
          head_sha: string;
          id?: string;
          open_issues: number;
          open_pull_requests: number;
          owner_id: string;
          project_id: string;
          repository_full_name: string;
          workflow_status: "success" | "failure" | "pending" | "cancelled" | "neutral" | "skipped" | "timed_out" | "action_required" | "stale" | "startup_failure" | "unknown" | "not_configured";
        };
        Update: {
          captured_at?: string;
          default_branch?: string;
          head_committed_at?: string;
          head_sha?: string;
          id?: string;
          open_issues?: number;
          open_pull_requests?: number;
          owner_id?: string;
          project_id?: string;
          repository_full_name?: string;
          workflow_status?: "success" | "failure" | "pending" | "cancelled" | "neutral" | "skipped" | "timed_out" | "action_required" | "stale" | "startup_failure" | "unknown" | "not_configured";
        };
        Relationships: [
          {
            foreignKeyName: "repository_snapshots_project_owner_fkey";
            columns: ["project_id", "owner_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id", "owner_id"];
          },
        ];
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
    Functions: {
      capture_repository_snapshot: {
        Args: {
          p_default_branch: string;
          p_head_committed_at: string;
          p_head_sha: string;
          p_open_issues: number;
          p_open_pull_requests: number;
          p_project_id: string;
          p_repository_full_name: string;
          p_workflow_status: string;
        };
        Returns: string;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

