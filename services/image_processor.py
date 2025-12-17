import cv2
import numpy as np
from PIL import Image
import base64
from io import BytesIO


class ImageProcessor:
    """画像処理サービス - レシートの検出、トリミング、補正を行う"""

    def __init__(self):
        self.min_contour_area = 1000  # 最小輪郭面積

    def detect_receipt_contour(self, image_bytes):
        """
        画像からレシートの輪郭を自動検出

        Args:
            image_bytes: 画像のバイトデータ

        Returns:
            dict: {
                'success': bool,
                'contour': list,  # [[x, y], [x, y], [x, y], [x, y]]
                'preview': str,  # Base64エンコードされたプレビュー画像
                'error': str (optional)
            }
        """
        try:
            # バイトデータをNumPy配列に変換
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                return {'success': False, 'error': '画像の読み込みに失敗しました'}

            # オリジナル画像のサイズを保存
            original_height, original_width = image.shape[:2]

            # グレースケールに変換
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # ノイズ除去
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)

            # エッジ検出
            edges = cv2.Canny(blurred, 50, 150)

            # モルフォロジー処理でエッジを強化
            kernel = np.ones((5, 5), np.uint8)
            dilated = cv2.dilate(edges, kernel, iterations=1)

            # 輪郭検出
            contours, _ = cv2.findContours(
                dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )

            if not contours:
                return {'success': False, 'error': '輪郭が検出できませんでした'}

            # 面積が最大の輪郭を取得
            largest_contour = max(contours, key=cv2.contourArea)

            # 輪郭を近似して四角形に
            epsilon = 0.02 * cv2.arcLength(largest_contour, True)
            approx = cv2.approxPolyDP(largest_contour, epsilon, True)

            # 四角形でない場合は、バウンディングボックスを使用
            if len(approx) != 4:
                x, y, w, h = cv2.boundingRect(largest_contour)
                approx = np.array([
                    [[x, y]],
                    [[x + w, y]],
                    [[x + w, y + h]],
                    [[x, y + h]]
                ])

            # 座標を並び替え (左上、右上、右下、左上の順)
            points = self._order_points(approx.reshape(4, 2))

            # プレビュー画像を生成（輪郭線を描画）
            preview_image = image.copy()
            cv2.drawContours(
                preview_image, [points.astype(np.int32)], -1, (0, 255, 0), 3
            )

            # Base64エンコード
            _, buffer = cv2.imencode('.jpg', preview_image)
            preview_base64 = base64.b64encode(buffer).decode('utf-8')

            # 座標をリストに変換
            contour_list = points.tolist()

            return {
                'success': True,
                'contour': contour_list,
                'preview': f'data:image/jpeg;base64,{preview_base64}'
            }

        except Exception as e:
            return {'success': False, 'error': f'輪郭検出エラー: {str(e)}'}

    def process_receipt(self, image_bytes, contour, brightness=0, contrast=1.0, denoise=False):
        """
        レシート画像を処理（トリミング、補正）

        Args:
            image_bytes: 画像のバイトデータ
            contour: 輪郭の座標 [[x, y], [x, y], [x, y], [x, y]]
            brightness: 明るさ調整 (-100 ~ 100)
            contrast: コントラスト調整 (0.5 ~ 2.0)
            denoise: ノイズ除去を行うか

        Returns:
            dict: {
                'success': bool,
                'processed_image': str,  # Base64エンコードされた画像
                'error': str (optional)
            }
        """
        try:
            # バイトデータをNumPy配列に変換
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                return {'success': False, 'error': '画像の読み込みに失敗しました'}

            # 輪郭をNumPy配列に変換
            pts = np.array(contour, dtype=np.float32)

            # 射影変換で台形補正
            warped = self._four_point_transform(image, pts)

            # ノイズ除去
            if denoise:
                warped = cv2.fastNlMeansDenoisingColored(warped, None, 10, 10, 7, 21)

            # 明るさとコントラストの調整
            if brightness != 0 or contrast != 1.0:
                warped = self._adjust_brightness_contrast(
                    warped, brightness, contrast
                )

            # シャープネスを上げる（文字を読みやすく）
            warped = self._sharpen_image(warped)

            # Base64エンコード
            _, buffer = cv2.imencode('.jpg', warped, [cv2.IMWRITE_JPEG_QUALITY, 95])
            processed_base64 = base64.b64encode(buffer).decode('utf-8')

            return {
                'success': True,
                'processed_image': f'data:image/jpeg;base64,{processed_base64}'
            }

        except Exception as e:
            return {'success': False, 'error': f'画像処理エラー: {str(e)}'}

    def _order_points(self, pts):
        """
        座標を左上、右上、右下、左下の順に並び替え
        """
        rect = np.zeros((4, 2), dtype=np.float32)

        # 合計が最小のものが左上、最大のものが右下
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]

        # 差分が最小のものが右上、最大のものが左下
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]

        return rect

    def _four_point_transform(self, image, pts):
        """
        四点透視変換でレシートをフラット化
        """
        rect = self._order_points(pts)
        (tl, tr, br, bl) = rect

        # 新しい画像の幅を計算
        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        maxWidth = max(int(widthA), int(widthB))

        # 新しい画像の高さを計算
        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        maxHeight = max(int(heightA), int(heightB))

        # 変換後の座標
        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]
        ], dtype=np.float32)

        # 透視変換行列を計算して適用
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))

        return warped

    def _adjust_brightness_contrast(self, image, brightness=0, contrast=1.0):
        """
        明るさとコントラストを調整
        """
        # 明るさ調整
        if brightness != 0:
            if brightness > 0:
                shadow = brightness
                highlight = 255
            else:
                shadow = 0
                highlight = 255 + brightness
            alpha_b = (highlight - shadow) / 255
            gamma_b = shadow

            image = cv2.addWeighted(image, alpha_b, image, 0, gamma_b)

        # コントラスト調整
        if contrast != 1.0:
            image = cv2.convertScaleAbs(image, alpha=contrast, beta=0)

        return image

    def _sharpen_image(self, image):
        """
        画像をシャープにする
        """
        kernel = np.array([[-1, -1, -1],
                          [-1,  9, -1],
                          [-1, -1, -1]])
        sharpened = cv2.filter2D(image, -1, kernel)
        return sharpened
