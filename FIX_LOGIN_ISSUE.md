# ログインエラーの修正方法

## 問題
「Internal server error」が表示されてログインできない
エラーコード: P2021 (テーブルが存在しない)

## 原因
1. データベースのマイグレーションが正しく適用されていない
2. テストユーザーが作成されていない

## 解決方法

### 方法1: Renderでデプロイを再実行（推奨）
1. GitHubに最新の変更をプッシュ
   ```bash
   git add .
   git commit -m "Add database initialization to build process"
   git push origin main
   ```

2. Renderが自動的に再デプロイを開始
3. ビルドプロセスでデータベースが初期化される

### 方法2: Render Shellで手動初期化（推奨）
1. Renderダッシュボードにログイン
2. 「construction-chat-app」サービスを選択
3. 「Shell」タブをクリック
4. 以下のコマンドを順番に実行：

   ```bash
   # データベーススキーマを直接適用
   npm run db:push
   
   # テストユーザーを作成
   node setup.js
   ```

### 方法3: 個別コマンドで実行
Render Shellで以下を順番に実行：
```bash
# データベースマイグレーション
npx prisma migrate deploy

# テストユーザー作成
node setup.js
```

## 確認方法
1. ヘルスチェック: `https://あなたのアプリURL/api/health`
2. テストアカウントでログイン:
   - メール: `admin@construction.com`
   - パスワード: `admin123`

## 環境変数の確認
Renderの環境変数に以下が設定されているか確認：
- `DATABASE_URL`: PostgreSQLの接続文字列
- `JWT_SECRET`: 認証用のシークレットキー（自動生成されるはず）

## デバッグ用コマンド
```bash
# データベース接続テスト
npx prisma db push

# ユーザー一覧確認
npx prisma studio
```

## よくある問題
1. **データベース接続エラー**: DATABASE_URLが正しく設定されているか確認
2. **権限エラー**: データベースユーザーに適切な権限があるか確認
3. **マイグレーションエラー**: `npx prisma migrate reset`で初期化してから再実行