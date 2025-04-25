// 例: zxingのBrowserQRCodeReaderを使う
// CDN等で読み込んでいる前提 (例: <script src="https://cdn.jsdelivr.net/npm/@zxing/browser"></script>)

window.startQrReader = async function (dotNetObjRef) {
    try {
        // カメラデバイスの取得を試みる
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        const videoElement = document.getElementById("videoElement");

        // 取得したストリームをvideoにセット
        try {
            if (!videoElement.srcObject) {
                videoElement.srcObject = stream;
            }

            if (videoElement.paused || videoElement.readyState < 3) {
                await videoElement.play();
            }
        } catch (err) {
            console.warn("再生エラー:", err);
        }

        // ZXingライブラリのインスタンスを作成
        const codeReader = new ZXing.BrowserMultiFormatReader();

        // ループ的にフレームを解析してQRコードを読み取る（タイマーやrequestAnimationFrameなども可）
        const checkQrCode = async () => {
            try {
                // 読み取りを試みる
                const result = await codeReader.decodeOnceFromVideoDevice(undefined, "videoElement");
                if (result) {
                    // QRコードが読み取れたら C#側のメソッドを呼ぶ
                    dotNetObjRef.invokeMethodAsync("OnQrCodeDetected", result.getText());
                }
            } catch (err) {
                // 何も検出されない場合はここにくる
                // console.log(err);
            } finally {
                // 連続で読み取る場合は継続してチェック
                requestAnimationFrame(checkQrCode);
            }
        };

        // 読み取り開始
        requestAnimationFrame(checkQrCode);

    } catch (err) {
        console.error("カメラ起動エラー:", err);
        alert("カメラのアクセスが許可されなかった、またはエラーが発生しました。");
    }
}
