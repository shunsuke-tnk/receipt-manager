interface ApiConnectionErrorProps {
  onRetry: () => void;
}

function ApiConnectionError({ onRetry }: ApiConnectionErrorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          サーバーに接続できません
        </h2>
        <p className="text-gray-600 mb-6">
          バックエンドAPIサーバーが起動していないか、ネットワークエラーが発生しています。
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-yellow-900 mb-2">🔧 解決方法</h3>
          <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
            <li>
              <strong>ローカル開発の場合:</strong>
              <br />
              <code className="bg-yellow-100 px-2 py-1 rounded text-xs">
                python app.py
              </code>{' '}
              でバックエンドを起動してください
            </li>
            <li>
              <strong>本番環境の場合:</strong>
              <br />
              Render.comのバックエンドサービスが起動しているか確認してください
            </li>
            <li>
              ブラウザのコンソール (F12) でエラーの詳細を確認
            </li>
          </ol>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            再試行
          </button>

          <a
            href="https://github.com/anthropics/claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
          >
            ヘルプを見る
          </a>
        </div>
      </div>
    </div>
  );
}

export default ApiConnectionError;
