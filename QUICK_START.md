# クイックスタートガイド

## 🚀 最速で起動する方法

### ステップ1: バックエンドを起動

```bash
./start.sh
```

または手動で:

```bash
source venv/bin/activate
python app.py
```

### ステップ2: 別のターミナルでフロントエンドを起動

```bash
npm run dev
```

### ステップ3: ブラウザで開く

http://localhost:5173

---

## ⚠️ よくあるエラー

### 「サーバーに接続できません」と表示される

**原因**: バックエンド (Flask) が起動していない

**解決策**:
1. 新しいターミナルを開く
2. `./start.sh` または `python app.py` を実行
3. ブラウザをリロード

確認: http://localhost:5000/api/health にアクセスして `{"status": "ok"}` が表示されればOK

### 「Drive連携」ボタンでエラー

**原因**: バックエンドが起動していない、または `credentials.json` が未設定

**解決策**:
1. バックエンドを起動（上記参照）
2. Google Cloud Consoleから `credentials.json` をダウンロードしてプロジェクトルートに配置

---

## 📋 必要な準備（初回のみ）

### 1. Python依存関係

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Node.js依存関係

```bash
npm install
```

### 3. 環境変数設定

```bash
cp .env.example .env
```

`.env` ファイルを編集して、Google Cloud Consoleから取得した情報を設定:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/oauth2callback
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
FLASK_SECRET_KEY=your_random_secret
```

### 4. credentials.json

Google Cloud Consoleから OAuth 2.0 認証情報をダウンロードし、プロジェクトルートに `credentials.json` として保存

---

## 🎯 起動の流れ

```
ターミナル1              ターミナル2
    │                       │
    ├─ ./start.sh           │
    │  (バックエンド起動)    │
    │  ↓                    │
    │  Flask起動完了        ├─ npm run dev
    │  (port 5000)          │  (フロントエンド起動)
    │                       │  ↓
    │                       │  Vite起動完了
    │                       │  (port 5173)
    │                       │
    │←─────────────────────→│
         両方起動したら
         ブラウザで
         http://localhost:5173
         を開く
```

---

## 💡 Tips

- **同時起動**: 2つのターミナルで別々に起動が必要
- **確認方法**: ブラウザのコンソール (F12) でエラーを確認
- **リロード**: バックエンド起動後はブラウザをリロード

---

詳細は [README.md](README.md) を参照
