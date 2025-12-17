# デプロイ手順書

このドキュメントでは、レシート管理アプリを本番環境にデプロイする手順を説明します。

## 前提条件

- Googleアカウント
- GitHubアカウント
- Render.comアカウント（バックエンド用）
- Vercelアカウント（フロントエンド用、またはNetlify）

## 全体の流れ

1. Google Cloud Consoleでプロジェクト設定
2. GitHubリポジトリ作成
3. バックエンドをRender.comにデプロイ
4. フロントエンドをVercelにデプロイ
5. 動作確認

---

## 1. Google Cloud Console設定

### 1.1 プロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名: `receipt-manager`（任意）

### 1.2 Google Drive APIを有効化

1. 「APIとサービス」→「ライブラリ」
2. "Google Drive API" を検索
3. 「有効にする」をクリック

### 1.3 OAuth認証情報を作成

1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「OAuth クライアント ID」
3. アプリケーションの種類: **Webアプリケーション**
4. 名前: `Receipt Manager Web`
5. **承認済みのリダイレクト URI** に追加:
   ```
   http://localhost:5000/oauth2callback
   https://your-api-domain.onrender.com/oauth2callback
   ```
   ※ `your-api-domain` は後でRenderから取得するURLに置き換えます

6. 「作成」をクリック
7. **クライアントID** と **クライアントシークレット** をコピーして保存

### 1.4 credentials.jsonをダウンロード

1. 作成したOAuthクライアントの右側の「JSONをダウンロード」
2. ファイル名を `credentials.json` に変更
3. **このファイルは後でRender.comにアップロードします**

### 1.5 Googleドライブフォルダを作成

1. [Google Drive](https://drive.google.com/) を開く
2. 新しいフォルダを作成: `レシート管理`
3. フォルダを開き、URLから **フォルダID** を取得:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```
   `FOLDER_ID_HERE` の部分をコピー

---

## 2. GitHubリポジトリ作成

### 2.1 Gitの初期化

```bash
cd "/Users/tanakashunsuke/レシート処理アプリ"
git init
git add .
git commit -m "Initial commit: Receipt Manager MVP"
```

### 2.2 GitHubにプッシュ

1. [GitHub](https://github.com/) で新しいリポジトリを作成
2. リポジトリ名: `receipt-manager`
3. Private または Public（お好みで）

```bash
git remote add origin https://github.com/YOUR_USERNAME/receipt-manager.git
git branch -M main
git push -u origin main
```

---

## 3. バックエンドをRender.comにデプロイ

### 3.1 Render.comアカウント作成

1. [Render.com](https://render.com/) にアクセス
2. GitHubアカウントでサインアップ

### 3.2 新しいWeb Serviceを作成

1. ダッシュボードで「New +」→「Web Service」
2. GitHubリポジトリ `receipt-manager` を選択
3. 設定:
   - **Name**: `receipt-manager-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free（または有料プラン）

### 3.3 環境変数を設定

「Environment」タブで以下を追加:

```
FLASK_ENV=production
FLASK_SECRET_KEY=<ランダムな長い文字列を生成>
GOOGLE_CLIENT_ID=<Google Cloud Consoleからコピー>
GOOGLE_CLIENT_SECRET=<Google Cloud Consoleからコピー>
GOOGLE_REDIRECT_URI=https://receipt-manager-api.onrender.com/oauth2callback
GOOGLE_DRIVE_FOLDER_ID=<GoogleドライブフォルダIDをコピー>
PORT=10000
```

**重要**: `FLASK_SECRET_KEY` は以下のコマンドで生成:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3.4 credentials.jsonをアップロード

Renderには直接ファイルアップロード機能がないため、以下のいずれかの方法:

#### 方法A: Secret Files機能（推奨）
1. Renderダッシュボードで「Secret Files」タブ
2. 「Add Secret File」をクリック
3. Filename: `credentials.json`
4. Contents: `credentials.json` の内容を貼り付け

#### 方法B: 環境変数として設定
1. `credentials.json` をBase64エンコード:
   ```bash
   base64 credentials.json
   ```
2. 環境変数 `GOOGLE_CREDENTIALS_BASE64` に設定
3. `app.py` で以下のコードを追加してデコード:
   ```python
   import base64
   import json

   creds_base64 = os.getenv('GOOGLE_CREDENTIALS_BASE64')
   if creds_base64:
       with open('credentials.json', 'w') as f:
           f.write(base64.b64decode(creds_base64).decode('utf-8'))
   ```

### 3.5 デプロイ

1. 「Create Web Service」をクリック
2. デプロイが完了するまで待つ（5-10分）
3. デプロイ完了後、URLが表示されます:
   ```
   https://receipt-manager-api.onrender.com
   ```

### 3.6 Google Cloud ConsoleでリダイレクトURIを更新

1. Google Cloud Consoleに戻る
2. OAuth認証情報を編集
3. 承認済みのリダイレクトURIに追加:
   ```
   https://receipt-manager-api.onrender.com/oauth2callback
   ```

---

## 4. フロントエンドをVercelにデプロイ

### 4.1 Vercelアカウント作成

1. [Vercel](https://vercel.com/) にアクセス
2. GitHubアカウントでサインアップ

### 4.2 新しいプロジェクトをインポート

1. 「Add New...」→「Project」
2. GitHubリポジトリ `receipt-manager` を選択
3. 設定:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.3 環境変数を設定

「Environment Variables」セクションで追加:

```
VITE_API_URL=https://receipt-manager-api.onrender.com
```

### 4.4 デプロイ

1. 「Deploy」をクリック
2. デプロイが完了するまで待つ（2-3分）
3. デプロイ完了後、URLが表示されます:
   ```
   https://receipt-manager.vercel.app
   ```

---

## 5. 動作確認

### 5.1 アプリにアクセス

1. ブラウザでフロントエンドURL（Vercel）を開く:
   ```
   https://receipt-manager.vercel.app
   ```

### 5.2 Google Drive認証

1. 画面右上の「Drive連携」ボタンをクリック
2. Googleアカウントでログイン
3. アクセス権限を許可
4. アプリに戻る

### 5.3 レシート撮影テスト

1. 「カメラを起動」または「ファイルから選択」
2. テスト画像をアップロード
3. 輪郭が自動検出されることを確認
4. 画像補正を適用
5. Googleドライブにアップロード
6. Googleドライブで保存されたことを確認

---

## トラブルシューティング

### バックエンドのログを確認

Render.comダッシュボード → 「Logs」タブ

### よくあるエラー

#### 1. CORSエラー
**症状**: フロントエンドからAPIにアクセスできない

**解決策**: `app.py` のCORS設定を確認
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://receipt-manager.vercel.app"],
        "supports_credentials": True
    }
})
```

#### 2. 認証エラー
**症状**: Google Drive認証が失敗する

**解決策**:
- `credentials.json` が正しくアップロードされているか確認
- リダイレクトURIが完全一致しているか確認（末尾のスラッシュにも注意）

#### 3. 画像処理エラー
**症状**: OpenCVが動作しない

**解決策**: `requirements.txt` で `opencv-python-headless` を使用していることを確認

#### 4. 環境変数が反映されない
**解決策**:
- Render/Vercelでサービスを再起動
- 環境変数名のスペルミス確認
- ビルドを再実行

---

## カスタムドメイン設定（オプション）

### Vercel

1. 「Settings」→「Domains」
2. カスタムドメインを追加
3. DNSレコードを設定

### Render.com

1. 「Settings」→「Custom Domains」
2. カスタムドメインを追加
3. DNSレコードを設定

---

## 定期的なメンテナンス

### 依存パッケージの更新

```bash
# Python
pip list --outdated
pip install --upgrade package-name

# Node.js
npm outdated
npm update
```

### セキュリティアップデート

定期的に GitHub Dependabot のアラートを確認

---

## 次のステップ

- OCR機能の追加（レシート情報の自動読み取り）
- データベース連携（支出管理）
- 複数ユーザー対応
- モバイルアプリ化（React Native等）

---

## サポート

問題が発生した場合:
1. [SECURITY.md](SECURITY.md) を確認
2. GitHubのIssuesで質問
3. ログを確認して原因を特定
