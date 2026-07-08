# パチログ 🎰

パチンコ・パチスロの実働データ(日付・場所・機種・投資額・回収額)を記録し、
週・月・年単位の収支をグラフで管理できる Web アプリです。他のユーザーの記録も
閲覧・コメントできます。

## 主な機能

- ログイン / 新規登録(メール & パスワード, Supabase Auth)
- プロフィール登録・編集(ユーザー名・自己紹介・アバター)
- 実働データ登録(日付・場所・機種・投資額・回収額・メモ)
- データ一覧(自分のみ / みんなの記録を切り替え)
- 収支グラフ(週別・月別・年別。投資額/回収額の比較グラフ付き、テーブル表示も可)
- データ詳細へのコメント機能
- スマートフォン対応(下部タブナビゲーション)

## 使用技術

| 分野 | 技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router) / React 19 / TypeScript / Tailwind CSS |
| グラフ | Recharts |
| バックエンド / DB | Supabase (PostgreSQL) |
| 認証 | Supabase Auth |
| デプロイ | Vercel |

## セットアップ

### 1. Supabase プロジェクトを作成

1. https://supabase.com でプロジェクトを新規作成します。
2. SQL Editor を開き、`supabase/schema.sql` の内容をそのまま実行します。
   - `profiles` / `records` / `comments` テーブル
   - 新規登録時に自動でプロフィールを作成するトリガー
   - Row Level Security ポリシー(閲覧は全員可、編集は本人のみ)
3. Authentication > Providers で Email 認証が有効になっていることを確認します。
   - 開発中にメール確認をスキップしたい場合は
     Authentication > Settings で "Confirm email" を無効にできます。
4. Authentication > URL Configuration の Redirect URLs に
   `http://localhost:3000/auth/callback` と、デプロイ後の
   `https://<your-domain>/auth/callback` を追加します。

### 2. 環境変数を設定

`.env.local.example` を `.env.local` にコピーし、Supabase の
Settings > API から Project URL と anon public key を設定してください。

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 依存関係インストール & 開発サーバー起動

```bash
npm install
npm run dev
```

http://localhost:3000 を開いて動作を確認してください。

## Vercel へのデプロイ

1. GitHub にリポジトリを push します。
2. [Vercel](https://vercel.com/new) で該当リポジトリを Import します。
3. Environment Variables に `.env.local` と同じ内容
   (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`) を設定します。
4. Deploy を実行します。
5. デプロイ後の URL を Supabase の Authentication > URL Configuration の
   Redirect URLs / Site URL に追加してください
   (例: `https://your-app.vercel.app/auth/callback`)。

## ディレクトリ構成(抜粋)

```
supabase/schema.sql       Supabase に投入する SQL (テーブル・RLS・トリガー)
src/middleware.ts         (→ src/proxy.ts) セッション更新・認証ガード
src/lib/supabase/         Supabase クライアント (browser/server/proxy用)
src/lib/aggregate.ts      週/月/年集計ロジック
src/app/login, /signup    認証画面
src/app/profile           プロフィール登録・編集・他ユーザー閲覧
src/app/records           データ登録・一覧・詳細・編集
src/app/stats             収支グラフ
src/app/comments/actions.ts  コメント投稿・削除
```

## データモデル

- `profiles`: ユーザーの公開プロフィール(username, bio, avatar_emoji)
- `records`: 実働データ(play_date, location, machine, investment, payout, memo)
- `comments`: records に対するコメント

いずれも Row Level Security が有効で、**閲覧はログイン済みユーザー全員に許可**、
**作成・更新・削除は本人のデータのみ**に制限しています。
