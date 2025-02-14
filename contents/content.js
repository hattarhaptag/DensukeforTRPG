console.log("Densuke for TRPG Loaded");

// 拡張機能が有効かどうかを確認
chrome.storage.local.get("extensionEnabled", (data) => {
    const isEnabled = data.extensionEnabled ?? true;
    if (!isEnabled) {
        console.log("Densuke for TRPG is disabled.");
        return;
    }

    setTimeout(() => {
        if (document.getElementById("densukeTRPGButton")) return;

        // id="listtable" の要素を取得
        const listtableElement = document.getElementById("listtable");

        if (!listtableElement) {
            alert("id='listtable' のテーブルが見つかりませんでした。");
            return;
        }

        // ボタンを作成
        const timeViewButton = document.createElement("button");
        timeViewButton.id = "densukeTRPGButton";
        timeViewButton.textContent = "時間帯別";

        // ボタンのスタイル
        timeViewButton.style.display = "block";  
        timeViewButton.style.marginBottom = "10px";  
        timeViewButton.style.padding = "10px 20px";
        timeViewButton.style.backgroundColor = "#4CAF50";
        timeViewButton.style.color = "white";
        timeViewButton.style.border = "none";
        timeViewButton.style.borderRadius = "5px";
        timeViewButton.style.cursor = "pointer";
        timeViewButton.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.3)";
        timeViewButton.style.fontSize = "14px";
        timeViewButton.style.zIndex = "1000";

        // ボタンクリック時の処理
        timeViewButton.addEventListener("click", () => {
             
            timeViewButton.disabled = true;
            console.log("ボタンがクリックされました。");

            // id="listtable" のテーブルのみ対象
            const rows = listtableElement.querySelectorAll("tr");

            if (rows.length === 0) {
                alert("日付のテーブルが見つかりませんでした。");
                return;
            }

            // 既存のセル幅を取得する関数
            function getCellWidth(row) {
                const lastTd = row.querySelector("td:last-child");
                return lastTd ? lastTd.offsetWidth + "px" : "auto";
            }

            // 結果判定ロジック
            function determineResult(values) {
                // 伝助の左から5つの要素は判定に使わない
                const relevantValues = values.slice(5);
            
                const inFull = relevantValues.includes("◎");
                const inDay = relevantValues.includes("○");
                const inNight = relevantValues.includes("△");
                const inNone = relevantValues.includes("×");
                const InPending = relevantValues.includes("-");
                const allPending = relevantValues.every(v => v === "-");
                
                // すべて未入力の場合は「未定」
                if (allPending) {
                    return "未定";
                }

                // 全員が「◎」のときは「全日」
                if (relevantValues.length > 0 && relevantValues.every(v => v === "◎")) {
                    return "全日";
                }
            
                // 「◎」と未入力（"-"）しかない場合は「全日？」
                if (inFull && !inDay && !inNight && !inNone && !allPending) {
                    return "全日？";
                }
            
                // 「×」が1人以上いる場合は「不可」
                if (inNone) return "不可";
            
                // 昼のみの人がいて夜のみの人がいない場合は「昼のみ」
                if (inDay && !inNight) return InPending ? "昼のみ？" : "昼のみ";
            
                // 夜のみの人がいて昼のみの人がいない場合は「夜のみ」
                if (inNight && !inDay) return InPending ? "夜のみ？" : "夜のみ";
            
                // それ以外の場合（昼と夜が混在している場合）は「不可」
                return "不可";
            }            
            

            // カテゴリと色の設定
            function getResultColor(result) {
                const colorMap = {
                    "全日": "#7fc483",     // 緑
                    "全日？": "#afdbb1",   // 濃い緑
                    "昼のみ": "#66b6f8",   // 青
                    "昼のみ？": "#aad5f8", // 濃い青
                    "夜のみ": "#ba6ac9",   // 紫
                    "夜のみ？": "#daabe2", // 濃い紫
                    "不可": "#f88e87",     // 赤
                    "未定": "#d1d1d1"      // 灰色
                };
                
                return colorMap[result] || "#FFFFFF";  // デフォルトは白
            }
            

            // 最初の行に「結果」テキストを追加
            const firstRow = rows[0];
            const resultHeaderCell = document.createElement("td");
            resultHeaderCell.textContent = "結果";
            resultHeaderCell.style.fontWeight = "bold";
            resultHeaderCell.style.textAlign = "center";
            resultHeaderCell.style.padding = "10px 30px 10px 30px";
            resultHeaderCell.style.backgroundColor = "#f4f4f4";
            resultHeaderCell.style.width = getCellWidth(firstRow);

            firstRow.appendChild(resultHeaderCell);

            // 各データ行を処理
            rows.forEach((row, index) => {
                if (index === 0) return; // 最初の行（ヘッダー）はスキップ

                // 各行のtd要素を取得
                const tds = row.querySelectorAll("td");
                const values = Array.from(tds).map(td => td.textContent.trim());

                // 結果を判定
                const result = determineResult(values);

                // 新しいセルを作成
                const td = document.createElement("td");
                td.textContent = result;
                td.style.fontWeight = "bold";
                td.style.fontSize = "1.0rem";
                td.style.textShadow = "1px 1px 0 #fff, -1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff";
                td.style.color = "#3d3d3d";
                td.style.backgroundColor = getResultColor(result);
                td.style.padding = "10px";
                td.style.textAlign = "center";
                td.style.width = getCellWidth(row);

                row.appendChild(td);
            });

            // ウィンドウのリサイズイベントを発生させてレイアウトを強制更新
            // (これがないと結果がテーブルの中に隠れて見えない)
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });

        // id="listtable" の上にボタンを追加
        listtableElement.parentNode.insertBefore(timeViewButton, listtableElement);

    }, 500); // 0.5秒遅らせる
});