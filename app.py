from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services.image_processor import ImageProcessor
from services.google_drive_service import GoogleDriveService
import base64
from io import BytesIO

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
CORS(app, supports_credentials=True)

# サービスの初期化
image_processor = ImageProcessor()
drive_service = GoogleDriveService()

# アップロード用の一時フォルダ
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/api/health', methods=['GET'])
def health_check():
    """ヘルスチェック"""
    return jsonify({'status': 'ok', 'message': 'Receipt Manager API is running'})


@app.route('/api/detect-contour', methods=['POST'])
def detect_contour():
    """
    画像から自動的にレシートの輪郭を検出
    """
    try:
        data = request.get_json()
        image_data = data.get('image')

        if not image_data:
            return jsonify({'error': '画像データが必要です'}), 400

        # Base64デコード
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        image_bytes = base64.b64decode(image_data)

        # 輪郭検出
        result = image_processor.detect_receipt_contour(image_bytes)

        if result['success']:
            return jsonify({
                'success': True,
                'contour': result['contour'],
                'preview': result['preview']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', '輪郭検出に失敗しました')
            }), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/process-image', methods=['POST'])
def process_image():
    """
    画像を処理（トリミング、補正）
    """
    try:
        data = request.get_json()
        image_data = data.get('image')
        contour = data.get('contour')  # [[x, y], [x, y], [x, y], [x, y]]
        brightness = data.get('brightness', 0)
        contrast = data.get('contrast', 1.0)
        denoise = data.get('denoise', False)

        if not image_data or not contour:
            return jsonify({'error': '画像データと輪郭情報が必要です'}), 400

        # Base64デコード
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        image_bytes = base64.b64decode(image_data)

        # 画像処理
        result = image_processor.process_receipt(
            image_bytes,
            contour,
            brightness=brightness,
            contrast=contrast,
            denoise=denoise
        )

        if result['success']:
            return jsonify({
                'success': True,
                'processed_image': result['processed_image']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', '画像処理に失敗しました')
            }), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/upload-to-drive', methods=['POST'])
def upload_to_drive():
    """
    処理済み画像をGoogleドライブにアップロード
    """
    try:
        data = request.get_json()
        image_data = data.get('image')
        filename = data.get('filename', 'receipt.jpg')

        if not image_data:
            return jsonify({'error': '画像データが必要です'}), 400

        # Base64デコード
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        image_bytes = base64.b64decode(image_data)

        # Googleドライブにアップロード
        result = drive_service.upload_file(image_bytes, filename)

        if result['success']:
            return jsonify({
                'success': True,
                'file_id': result['file_id'],
                'web_view_link': result.get('web_view_link')
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'アップロードに失敗しました')
            }), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    """Google Drive認証状態を確認"""
    try:
        is_authenticated = drive_service.is_authenticated()
        return jsonify({
            'authenticated': is_authenticated
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/url', methods=['GET'])
def get_auth_url():
    """Google Drive認証URLを取得"""
    try:
        auth_url = drive_service.get_authorization_url()
        return jsonify({
            'auth_url': auth_url
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/oauth2callback')
def oauth2callback():
    """Google OAuth2コールバック"""
    try:
        code = request.args.get('code')
        if not code:
            return 'Authorization code not found', 400

        success = drive_service.handle_oauth_callback(code)

        if success:
            return redirect('/?auth=success')
        else:
            return redirect('/?auth=failed')

    except Exception as e:
        return str(e), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)
