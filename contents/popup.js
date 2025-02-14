document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.getElementById("toggleExtension");
    const statusText = document.getElementById("statusText");

    // ストレージから設定を取得してスイッチを初期化
    chrome.storage.local.get("extensionEnabled", (data) => {
        const isEnabled = data.extensionEnabled ?? true; // デフォルトはオン
        toggleSwitch.checked = isEnabled;
        statusText.textContent = isEnabled ? "拡張機能: オン" : "拡張機能: オフ";
    });

    // スイッチの切り替え時に状態を保存
    toggleSwitch.addEventListener("change", () => {
        const isEnabled = toggleSwitch.checked;
        chrome.storage.local.set({ extensionEnabled: isEnabled });
        statusText.textContent = isEnabled ? "拡張機能: オン" : "拡張機能: オフ";
        
        // 拡張機能をON/OFFにするためにページをリロード
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    });
});
