// Supabase の生成型を使わず、手書きの最小限の型定義。
// `supabase gen types typescript` を使う場合はこのファイルを置き換えてください。

export type Profile = {
  id: string;
  username: string;
  bio: string | null;
  avatar_emoji: string | null;
  avatar_url: string | null;
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
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type RecordWithProfile = Record & {
  diff: number;
  username: string;
  avatar_emoji: string | null;
  avatar_url: string | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  bookmarked_by_me: boolean;
};

export type Comment = {
  id: string;
  record_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type CommentWithProfile = Comment & {
  profiles: Pick<Profile, "username" | "avatar_emoji" | "avatar_url"> | null;
};

export type Follow = {
  follower_id: string;
  followee_id: string;
  created_at: string;
};

export type Notification = {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: "like" | "comment" | "follow";
  record_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type NotificationWithActor = Notification & {
  actor: Pick<Profile, "username" | "avatar_emoji" | "avatar_url"> | null;
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
      follows: {
        Row: Follow;
        Insert: { follower_id: string; followee_id: string };
        Update: Partial<Follow>;
        Relationships: [];
      };
      record_likes: {
        Row: { record_id: string; user_id: string; created_at: string };
        Insert: { record_id: string; user_id: string };
        Update: never;
        Relationships: [];
      };
      record_bookmarks: {
        Row: { record_id: string; user_id: string; created_at: string };
        Insert: { record_id: string; user_id: string };
        Update: never;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> & {
          recipient_id: string;
          actor_id: string;
          type: Notification["type"];
        };
        Update: Partial<Notification>;
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
