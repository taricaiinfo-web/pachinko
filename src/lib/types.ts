// Supabase の生成型を使わず、手書きの最小限の型定義。
// `supabase gen types typescript` を使う場合はこのファイルを置き換えてください。

export type Profile = {
  id: string;
  username: string;
  bio: string | null;
  avatar_emoji: string | null;
  created_at: string;
  updated_at: string;
};

export type Record = {
  id: string;
  user_id: string;
  play_date: string; // YYYY-MM-DD
  location: string;
  machine: string;
  investment: number;
  payout: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type RecordWithProfile = Record & {
  diff: number;
  username: string;
  avatar_emoji: string | null;
};

export type Comment = {
  id: string;
  record_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type CommentWithProfile = Comment & {
  profiles: Pick<Profile, "username" | "avatar_emoji"> | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      records: {
        Row: Record;
        Insert: Partial<Record> & {
          user_id: string;
          play_date: string;
          location: string;
          machine: string;
          investment: number;
          payout: number;
        };
        Update: Partial<Record>;
        Relationships: [];
      };
      comments: {
        Row: Comment;
        Insert: Partial<Comment> & {
          record_id: string;
          user_id: string;
          content: string;
        };
        Update: Partial<Comment>;
        Relationships: [];
      };
    };
    Views: {
      records_with_profile: {
        Row: RecordWithProfile;
        Relationships: [];
      };
    };
    Functions: Record0;
    Enums: Record0;
    CompositeTypes: Record0;
  };
};

// `Record<string, never>` を使いたいが、上で `Record` を独自定義で上書きしているため
// 別名を用意する。
type Record0 = { [key: string]: never };
