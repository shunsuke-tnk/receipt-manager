import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from io import BytesIO
import json
from datetime import datetime


class GoogleDriveService:
    """Google Drive APIサービス"""

    SCOPES = ['https://www.googleapis.com/auth/drive.file']
    TOKEN_FILE = 'token.json'
    CREDENTIALS_FILE = 'credentials.json'

    def __init__(self):
        self.credentials = None
        self.service = None
        self.folder_id = os.getenv('GOOGLE_DRIVE_FOLDER_ID')
        self._load_credentials()

    def _load_credentials(self):
        """保存された認証情報を読み込む"""
        if os.path.exists(self.TOKEN_FILE):
            try:
                self.credentials = Credentials.from_authorized_user_file(
                    self.TOKEN_FILE, self.SCOPES
                )
            except Exception as e:
                print(f"認証情報の読み込みエラー: {e}")
                self.credentials = None

        # 認証情報が無効な場合はリフレッシュ
        if self.credentials and self.credentials.expired and self.credentials.refresh_token:
            try:
                self.credentials.refresh(Request())
                self._save_credentials()
            except Exception as e:
                print(f"トークンのリフレッシュエラー: {e}")
                self.credentials = None

        # サービスを初期化
        if self.credentials and self.credentials.valid:
            self.service = build('drive', 'v3', credentials=self.credentials)

    def _save_credentials(self):
        """認証情報を保存"""
        if self.credentials:
            with open(self.TOKEN_FILE, 'w') as token:
                token.write(self.credentials.to_json())

    def is_authenticated(self):
        """認証済みかどうかを確認"""
        return self.credentials is not None and self.credentials.valid

    def get_authorization_url(self):
        """OAuth2認証URLを取得"""
        if not os.path.exists(self.CREDENTIALS_FILE):
            raise FileNotFoundError(
                'credentials.jsonが見つかりません。Google Cloud Consoleから取得してください。'
            )

        flow = Flow.from_client_secrets_file(
            self.CREDENTIALS_FILE,
            scopes=self.SCOPES,
            redirect_uri=os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5000/oauth2callback')
        )

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )

        return authorization_url

    def handle_oauth_callback(self, code):
        """OAuth2コールバックを処理"""
        try:
            flow = Flow.from_client_secrets_file(
                self.CREDENTIALS_FILE,
                scopes=self.SCOPES,
                redirect_uri=os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5000/oauth2callback')
            )

            flow.fetch_token(code=code)
            self.credentials = flow.credentials
            self._save_credentials()

            # サービスを初期化
            self.service = build('drive', 'v3', credentials=self.credentials)

            return True

        except Exception as e:
            print(f"OAuth認証エラー: {e}")
            return False

    def upload_file(self, file_bytes, filename=None):
        """
        ファイルをGoogleドライブにアップロード

        Args:
            file_bytes: ファイルのバイトデータ
            filename: ファイル名（省略時は自動生成）

        Returns:
            dict: {
                'success': bool,
                'file_id': str,
                'web_view_link': str,
                'error': str (optional)
            }
        """
        if not self.is_authenticated():
            return {
                'success': False,
                'error': 'Google Driveに認証されていません'
            }

        try:
            # ファイル名が指定されていない場合は自動生成
            if not filename:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f'receipt_{timestamp}.jpg'

            # ファイルメタデータ
            file_metadata = {
                'name': filename,
                'mimeType': 'image/jpeg'
            }

            # フォルダIDが指定されている場合は親フォルダを設定
            if self.folder_id:
                file_metadata['parents'] = [self.folder_id]

            # バイトデータをアップロード可能な形式に変換
            media = MediaIoBaseUpload(
                BytesIO(file_bytes),
                mimetype='image/jpeg',
                resumable=True
            )

            # ファイルをアップロード
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, webViewLink'
            ).execute()

            return {
                'success': True,
                'file_id': file.get('id'),
                'web_view_link': file.get('webViewLink')
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'アップロードエラー: {str(e)}'
            }

    def list_files(self, limit=10):
        """
        アップロードしたファイルのリストを取得

        Args:
            limit: 取得するファイル数

        Returns:
            dict: {
                'success': bool,
                'files': list,
                'error': str (optional)
            }
        """
        if not self.is_authenticated():
            return {
                'success': False,
                'error': 'Google Driveに認証されていません'
            }

        try:
            query = "mimeType='image/jpeg'"
            if self.folder_id:
                query += f" and '{self.folder_id}' in parents"

            results = self.service.files().list(
                q=query,
                pageSize=limit,
                fields="files(id, name, webViewLink, createdTime)",
                orderBy="createdTime desc"
            ).execute()

            files = results.get('files', [])

            return {
                'success': True,
                'files': files
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'ファイルリスト取得エラー: {str(e)}'
            }
