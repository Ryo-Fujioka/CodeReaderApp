window.cameraInterop = {
    startCamera: function (dotNetRef) {
        // カメラ映像を表示するvideo要素を取得
        const video = document.getElementById('videoElement');

        // カメラにアクセス
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(stream => {
                video.srcObject = stream;
                video.play();

                // カメラ映像が開始されたらバーコードのスキャンを開始
                startScanning(video, dotNetRef);
            })
            .catch(err => {
                console.error("カメラアクセスに失敗: ", err);
            });
    }
};

function startScanning(video, dotNetRef) {
    // 解析に使うキャンバスを用意
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // ここでは例として zxing-js/library の読み取りを想定
    // あるいは jsQR でもOK
    // 例）npmなどからインストールした zxing/browser.mjs を読み込む方法など
    //     （CDN経由でも可）
    const codeReader = new ZXing.BrowserQRCodeReader();

    const scan = () => {
        // キャンバスのサイズをvideoのサイズと合わせる
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // キャンバスに現在のフレームを描画
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // zxing でdecodeFromCanvas
        codeReader.decodeFromCanvas(canvas)
            .then(result => {
                if (result && result.text) {
                    console.log("デコード成功: ", result.text);
                    // バーコード文字列をBlazorへ通知
                    dotNetRef.invokeMethodAsync("OnBarcodeDecoded", result.text);
                }
            })
            .catch(err => {
                // バーコードが見つからない場合などはエラーになるが
                // console.log("デコード失敗: ", err);
            })
            .finally(() => {
                // 定期的にスキャンを継続
                requestAnimationFrame(scan);
            });
    };

    requestAnimationFrame(scan);
}
