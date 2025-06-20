# 建設業界向けファイルバージョン管理機能付きチャットアプリケーション

建設業界で使用する、ファイルのバージョン管理機能を核とするWebベースのチャットアプリケーションです。複数の会社・担当者間でファイルを共有する際に、常に最新版を参照できることを保証し、過去のバージョンも追跡可能にします。

## 🚀 主要機能

### 基本機能
- ✅ **JWT認証システム** - セキュアなユーザー認証
- ✅ **リアルタイムチャット** - WebSocket(Socket.io)による即座のメッセージング
- ✅ **チャットルーム管理** - プロジェクトごとのルーム作成・メンバー招待
- ✅ **メンション機能** - @ユーザー名でのメンション・通知システム

### ファイル管理機能（最重要）
- ✅ **ファイルアップロード** - 最大10MB、複数形式対応
- ✅ **自動バージョン管理** - v1.0, v1.1形式での自動採番
- ✅ **新規/更新選択** - アップロード時の新規ファイルか既存更新かの選択
- ✅ **バージョンコメント** - 各バージョンでの変更内容記録
- ✅ **重複チェック** - ファイルハッシュによる同一内容の検出

### プレビュー・表示機能
- ✅ **PDFプレビュー** - PDF.jsによるブラウザ内表示
- ✅ **画像プレビュー** - 標準的な画像ビューア（ピンチズーム対応）
- ✅ **Excelプレビュー** - SheetJSによる簡易表示
- ✅ **旧バージョン警告** - 古いバージョン閲覧時の警告表示

### UI/UX
- ✅ **レスポンシブデザイン** - デスクトップファースト、モバイル対応
- ✅ **ファイル一覧パネル** - バージョン履歴の詳細表示
- ✅ **モバイル対応** - タッチ操作・ハンバーガーメニュー

## 🛠 技術スタック

- **フロントエンド**: Next.js 15, React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes, カスタムWebSocketサーバー
- **データベース**: PostgreSQL + Prisma ORM
- **リアルタイム通信**: Socket.io
- **認証**: JWT
- **ファイル処理**: PDF.js, SheetJS
- **スタイリング**: Tailwind CSS

## 📋 必要な環境

- Node.js 18.0.0以上
- PostgreSQL 13以上
- npm または yarn

## 🔧 セットアップ手順

### 1. 前提条件の確認
- Node.js 18.0.0以上
- PostgreSQL 13以上
- Git

### 2. PostgreSQLデータベースの準備
```bash
# PostgreSQLに接続
psql -U postgres

# データベース作成
CREATE DATABASE construction_chat;
CREATE USER chat_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE construction_chat TO chat_user;
\q
```

### 3. プロジェクトのセットアップ
```bash
# リポジトリのクローン
git clone <repository-url>
cd construction-chat-app

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
```

### 4. 環境変数の設定
`.env`ファイルを編集：
```env
DATABASE_URL="postgresql://chat_user:your_password@localhost:5432/construction_chat"
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### 5. データベースのセットアップ
```bash
# Prisma クライアント生成
npm run db:generate

# データベースマイグレーション実行
npm run db:migrate

# 初期データとテストユーザーの作成
npm run setup
```

### 6. アプリケーションの起動
```bash
# 開発サーバー起動
npm run dev
```

### 7. アクセス確認
- ブラウザで http://localhost:3000 にアクセス
- テストアカウントでログイン：
  - Email: `admin@construction.com`
  - Password: `admin123`

### 🎯 クイックスタート（既存のPostgreSQLがある場合）
```bash
git clone <repository-url> && cd construction-chat-app
npm install
cp .env.example .env
# .envファイルのDATABASE_URLを編集
npm run db:generate && npm run db:migrate && npm run setup
npm run dev
```

## 📁 プロジェクト構造

```
construction-chat-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API エンドポイント
│   │   │   ├── auth/          # 認証関連API
│   │   │   ├── files/         # ファイル関連API
│   │   │   ├── messages/      # メッセージAPI
│   │   │   ├── rooms/         # ルーム管理API
│   │   │   └── user/          # ユーザー情報API
│   │   ├── login/             # ログインページ
│   │   ├── register/          # 登録ページ
│   │   └── page.tsx           # メインチャットページ
│   ├── components/            # Reactコンポーネント
│   │   ├── CreateRoomModal.tsx
│   │   ├── FileUploadModal.tsx
│   │   ├── FilePreview.tsx
│   │   ├── FileList.tsx
│   │   └── MentionInput.tsx
│   ├── lib/                   # ユーティリティ
│   │   ├── auth.ts           # 認証ヘルパー
│   │   ├── fileUtils.ts      # ファイル処理
│   │   ├── prisma.ts         # Prismaクライアント
│   │   └── socket.ts         # WebSocket管理
│   └── middleware.ts          # 認証ミドルウェア
├── prisma/
│   └── schema.prisma         # データベーススキーマ
├── uploads/                  # アップロードファイル保存先
├── server.js                 # カスタムWebSocketサーバー
├── setup.js                  # 初期データ作成スクリプト
├── ecosystem.config.js       # PM2設定（本番用）
└── DEPLOYMENT.md            # 詳細なデプロイ手順
```

## 🎯 使用方法

### 1. アカウント作成・ログイン
- 新規ユーザー登録またはログイン
- 認証トークンは7日間有効

### 2. チャットルーム
- 「+ 新規」ボタンでルーム作成
- プロジェクトごとにルームを分けて管理
- メンバーをメールアドレスで招待

### 3. ファイル管理
- 「📎 ファイル」ボタンでアップロード
- 新規ファイル or 既存ファイル更新を選択
- バージョンコメントで変更内容を記録
- 右パネルでファイル一覧・バージョン履歴確認

### 4. ファイルプレビュー
- PDF、画像、Excelファイルのブラウザ内プレビュー
- バージョン比較・ダウンロード機能
- 旧バージョン閲覧時の警告表示

### 5. メンション機能
- `@ユーザー名` でメンション
- 入力時の自動補完機能
- メンション時の通知

## 🔒 セキュリティ機能

- JWT認証によるセキュアなアクセス制御
- ルーム単位でのファイルアクセス制限
- ファイルURLの有効期限設定
- 10MB制限によるアップロード制御
- ファイルハッシュによる重複チェック

## 📱 対応環境

### デスクトップ
- Chrome 最新版
- Firefox 最新版
- Safari 最新版
- Edge 最新版

### モバイル
- iPhone Safari
- Android Chrome
- レスポンシブデザインで最適化

## 🚀 本番環境デプロイ

詳細な本番環境へのデプロイ手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

### Vercel（推奨）
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t construction-chat-app .
docker run -p 3000:3000 construction-chat-app
```

## 🤝 開発・貢献

### 利用可能なスクリプト

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # 本番サーバー起動
npm run lint         # ESLint実行
npm run setup        # 初期データ作成
npm run db:migrate   # データベースマイグレーション
npm run db:generate  # Prismaクライアント生成
npm run db:reset     # データベースリセット
```

### 開発時の注意点

1. **WebSocket接続**: カスタムサーバー(`server.js`)を使用
2. **ファイル保存**: `uploads/`ディレクトリに保存
3. **認証**: JWTトークンをCookieで管理
4. **バージョン管理**: ファイルハッシュで重複検出

## 🔧 トラブルシューティング

### よくある問題

1. **データベース接続エラー**
   - PostgreSQLサービスが起動しているか確認
   - DATABASE_URLの設定を確認

2. **ファイルアップロードエラー**
   - uploadsディレクトリの権限を確認
   - ファイルサイズが10MB以下か確認

3. **WebSocket接続エラー**
   - ポート3000が使用可能か確認
   - ファイアウォール設定を確認

### サポート

問題が発生した場合は、以下の情報と共にIssueを作成してください：
- エラーメッセージ
- 環境情報（OS、ブラウザ、Node.jsバージョン）
- 再現手順

## 📝 ライセンス

このプロジェクトは建設業界向けに特化して開発されています。

---

**🏗️ 建設業界のデジタル化を支援するファイル管理・コミュニケーションソリューション**