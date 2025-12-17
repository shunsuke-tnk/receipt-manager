# 本番環境への即時デプロイ手順

このガイドは、現在のローカル環境（ポート5001で正常動作）を本番環境にデプロイする手順です。

## 前提条件の確認

以下が揃っていることを確認してください:

- [ ] Google Cloud Consoleでプロジェクトを作成済み
- [ ] Google Drive APIを有効化済み
- [ ] OAuth認証情報（クライアントID、クライアントシークレット）を取得済み
- [ ] `credentials.json` をダウンロード済み
- [ ] Googleドライブにアップロード用フォルダを作成済み（フォルダIDを控える）
- [ ] GitHubアカウントあり
- [ ] Render.comアカウントあり
- [ ] Vercelアカウントあり

## ステップ1: GitHubリポジトリ作成とプッシュ

### 1.1 Gitの初期化（未実施の場合）

```bash
cd "/Users/tanakashunsuke/レシート処理アプリ"
git init
```

### 1.2 GitHubで新しいリポジトリを作成

1. [GitHub](https://github.com/new) にアクセス
2. リポジトリ名: `receipt-manager`（任意）
3. Private または Public を選択
4. 「Create repository」をクリック

### 1.3 コードをプッシュ

```bash
# GitHubのリポジトリURLに置き換えてください
git remote add origin https://github.com/YOUR_USERNAME/receipt-manager.git

# すべてのファイルをコミット
git add .
git commit -m "Initial commit: Receipt Manager with port 5001"

# プッシュ
git branch -M main
git push -u origin main
```

## ステップ2: Render.comでバックエンドをデプロイ

### 2.1 新しいWeb Serviceを作成

1. [Render.com](https://dashboard.render.com/) にログイン
2. 「New +」→「Web Service」をクリック
3. GitHubリポジトリ `receipt-manager` を選択して「Connect」

### 2.2 設定を入力

- **Name**: `receipt-manager-api`
- **Region**: Singapore（または最寄りのリージョン）
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- **Instance Type**: Free（または有料プラン）

### 2.3 環境変数を設定

「Environment」タブまたは下部の「Advanced」から以下を追加:

```
FLASK_ENV=production
FLASK_SECRET_KEY=<以下のコマンドで生成した値を貼り付け>
GOOGLE_CLIENT_ID=<Google Cloud Consoleからコピー>
GOOGLE_CLIENT_SECRET=<Google Cloud Consoleからコピー>
GOOGLE_REDIRECT_URI=https://receipt-manager-api.onrender.com/oauth2callback
GOOGLE_DRIVE_FOLDER_ID=<GoogleドライブフォルダIDをコピー>
```

#### FLASK_SECRET_KEYの生成方法

ターミナルで以下を実行:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

出力された文字列をコピーして `FLASK_SECRET_KEY` に設定してください。

**注意**: `receipt-manager-api` の部分は、Renderで自動生成される実際のサービス名に置き換えてください。

### 2.4 credentials.jsonをアップロード

Renderの「Secret Files」機能を使用:

1. サービス設定画面で「Secret Files」タブをクリック
2. 「Add Secret File」をクリック
3. **Filename**: `credentials.json`
4. **Contents**: ローカルの `credentials.json` の内容をコピー&ペースト
5. 「Save」をクリック

### 2.5 デプロイを開始

1. 「Create Web Service」をクリック
2. デプロイが自動的に開始されます（5-10分）
3. デプロイ完了後、URLが表示されます:
   ```
   https://receipt-manager-api-xxxx.onrender.com
   ```
   このURLをメモしてください。

### 2.6 Google Cloud ConsoleでリダイレクトURIを更新

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 「APIとサービス」→「認証情報」
3. 作成したOAuth 2.0クライアントIDをクリック
4. 「承認済みのリダイレクトURI」に以下を追加:
   ```
   https://receipt-manager-api-xxxx.onrender.com/oauth2callback
   ```
   ※ `xxxx` は実際のRenderのURLに置き換え
5. 「保存」をクリック

## ステップ3: Vercelでフロントエンドをデプロイ

### 3.1 新しいプロジェクトをインポート

1. [Vercel](https://vercel.com/new) にアクセス
2. 「Import Git Repository」をクリック
3. GitHubリポジトリ `receipt-manager` を選択
4. 「Import」をクリック

### 3.2 プロジェクト設定

- **Project Name**: `receipt-manager`（任意）
- **Framework Preset**: Vite
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `dist`（デフォルト）

### 3.3 環境変数を設定

「Environment Variables」セクションで追加:

| NAME | VALUE |
|------|-------|
| `VITE_API_URL` | `https://receipt-manager-api-xxxx.onrender.com/api` |

※ `xxxx` はステップ2.5でメモしたRenderのURLに置き換え
※ 末尾の `/api` を忘れないでください

### 3.4 デプロイを開始

1. 「Deploy」をクリック
2. デプロイが自動的に開始されます（2-3分）
3. デプロイ完了後、URLが表示されます:
   ```
   https://receipt-manager-xxxx.vercel.app
   ```

## ステップ4: 動作確認

### 4.1 アプリにアクセス

ブラウザでVercelのURLを開く:
```
https://receipt-manager-xxxx.vercel.app
```

### 4.2 Google Drive認証をテスト

1. 画面右上の「Drive連携」ボタンをクリック
2. Googleアカウントでログイン
3. アクセス権限を許可
4. アプリに戻ることを確認

### 4.3 レシート撮影をテスト

1. 「カメラを起動」または「ファイルから選択」をクリック
2. テスト画像をアップロード
3. 輪郭が自動検出されることを確認
4. 必要に応じて画像補正を調整
5. 「Driveにアップロード」をクリック
6. [Googleドライブ](https://drive.google.com/)で保存されたことを確認

## トラブルシューティング

### エラー: "サーバーに接続できません"

**原因**: バックエンドが起動していない、またはURLが間違っている

**解決策**:
1. Render.comのダッシュボードで「Logs」タブを確認
2. サービスが正常に起動しているか確認
3. Vercelの環境変数 `VITE_API_URL` が正しいか確認（末尾に `/api` があるか）
4. ブラウザのコンソール（F12）でエラーメッセージを確認

### エラー: "Drive連携"でエラーが出る

**原因**: Google Cloud Consoleの設定が不完全

**解決策**:
1. リダイレクトURIがRenderのURLと完全一致しているか確認
2. `credentials.json` が正しくRenderにアップロードされているか確認
3. 環境変数 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` が正しいか確認

### デプロイ後にビルドエラーが発生

**Render（バックエンド）**:
- `requirements.txt` に全ての依存パッケージが含まれているか確認
- Pythonバージョンを確認（Python 3.11推奨）

**Vercel（フロントエンド）**:
- `package.json` に全ての依存パッケージが含まれているか確認
- Node.jsバージョンを確認（18.x以上推奨）

## 次のステップ

デプロイが完了したら:

1. スマートフォンでアクセスして動作確認
2. ホーム画面に追加（PWA機能）
3. 実際のレシートで動作テスト
4. Google Driveに正しく保存されるか確認

## 更新する場合

コードを修正した場合の再デプロイ方法:

```bash
# 変更をコミット
git add .
git commit -m "Update: 修正内容を記載"

# プッシュ
git push origin main
```

Render.comとVercelは自動的にデプロイを開始します。

---

詳細な手順やトラブルシューティングは [DEPLOYMENT.md](DEPLOYMENT.md) を参照してください。
