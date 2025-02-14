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

        if (document.getElementById("bulkbtn")) {
            console.log("日程入力画面なのでボタンを表示しません。")
            return;
        }

        const listtableElement = document.getElementById("listtable");
        if (!listtableElement) {
            alert("id='listtable' のテーブルが見つかりませんでした。");
            return;
        }

        const timeViewButton = document.createElement("button");
        timeViewButton.id = "densukeTRPGButton";
        timeViewButton.textContent = "時間帯別";
        timeViewButton.style.marginRight = "10px";
        timeViewButton.style.padding = "10px 20px";
        timeViewButton.style.border = "none";
        timeViewButton.style.borderRadius = "6px";
        timeViewButton.style.cursor = "pointer";
        timeViewButton.style.backgroundColor = "#4CAF50";
        timeViewButton.style.color = "white";
        timeViewButton.style.fontSize = "14px";
        timeViewButton.style.fontWeight = "bold";
        timeViewButton.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.3)";

        const toggleDayNightButton = document.createElement("button")
        toggleDayNightButton.textContent = "O = 昼☀️"
        toggleDayNightButton.style.backgroundColor = "#81b2fc";
        toggleDayNightButton.style.color = "#3d3d3d";
        toggleDayNightButton.id = "toggleDayNightButton"
        toggleDayNightButton.style.display = "none";
        toggleDayNightButton.style.padding = "10px 20px";
        toggleDayNightButton.style.border = "none";
        toggleDayNightButton.style.borderRadius = "6px";
        toggleDayNightButton.style.cursor = "pointer";
        toggleDayNightButton.style.fontSize = "14px";
        toggleDayNightButton.style.fontWeight = "bold";
        toggleDayNightButton.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.3)";
        
        let isNightMode = false;

        function styleToggleButton() {
            toggleDayNightButton.style.display = "inline-block";
            if (isNightMode) {
                toggleDayNightButton.textContent = "O = 夜🌙";
                toggleDayNightButton.style.backgroundColor = "#37474F";
                toggleDayNightButton.style.color = "#FFFFFF";
            } else {
                toggleDayNightButton.textContent = "O = 昼☀️";
                toggleDayNightButton.style.backgroundColor = "#81b2fc";
                toggleDayNightButton.style.color = "#3d3d3d";
            }
        }
        
        function getResultColor(result) {
            const colorMap = {
                "全日": "#7fc483",
                "全日？": "#afdbb1",
                "昼のみ": "#66b6f8",
                "昼のみ？": "#aad5f8",
                "夜のみ": "#ba6ac9",
                "夜のみ？": "#daabe2",
                "不可": "#f88e87",
                "未定": "#d1d1d1"
            };
            return colorMap[result] || "#FFFFFF";
        }
        
        function determineResult(values) {
            const relevantValues = values.slice(5);
            const inFull = relevantValues.includes("◎");
            const inDay = relevantValues.includes(isNightMode ? "△" : "○");
            const inNight = relevantValues.includes(isNightMode ? "○" : "△");
            const inNone = relevantValues.includes("×");
            const inPending = relevantValues.includes("-");
            const allPending = relevantValues.every(v => v === "-");

            if (allPending) return "未定";
            if (relevantValues.length > 0 && relevantValues.every(v => v === "◎")) return "全日";
            if (inFull && !inDay && !inNight && !inNone && !allPending) return "全日？";
            if (inNone) return "不可";
            if (inDay && !inNight) return inPending ? "昼のみ？" : "昼のみ";
            if (inNight && !inDay) return inPending ? "夜のみ？" : "夜のみ";
            return "不可";
        }
        
        function updateResults() {
            console.log("結果を更新します。");
            const rows = listtableElement.querySelectorAll("tr");
            if (rows.length === 0) return;

            // 最初の行に「結果」テキストを追加
            const firstRow = rows[0];
            let resultHeaderCell = firstRow.querySelector(".result-header-cell");
            if (!resultHeaderCell) {
                resultHeaderCell = document.createElement("td");
                resultHeaderCell.textContent = "結果";
                resultHeaderCell.classList.add("result-header-cell");
                resultHeaderCell.style.fontWeight = "bold";
                resultHeaderCell.style.textAlign = "center";
                resultHeaderCell.style.padding = "10px 30px 10px 30px";
                resultHeaderCell.style.backgroundColor = "#f4f4f4";
                firstRow.appendChild(resultHeaderCell);
            }

            rows.forEach((row, index) => {
                if (index === 0) return;
                const tds = row.querySelectorAll("td:not(.result-cell)");
                const values = Array.from(tds).map(td => td.textContent.trim());
                const result = determineResult(values);
                let resultCell = row.querySelector(".result-cell");
                if (!resultCell) {
                    resultCell = document.createElement("td");
                    resultCell.classList.add("result-cell");
                    row.appendChild(resultCell);
                }
                resultCell.textContent = result;
                resultCell.style.fontWeight = "bold";
                resultCell.style.fontSize = "1.0rem";
                resultCell.style.textShadow = "1px 1px 0 #fff, -1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff";
                resultCell.style.color = "#3d3d3d";
                resultCell.style.backgroundColor = getResultColor(result);
                resultCell.style.padding = "10px";
                resultCell.style.textAlign = "center";
            });
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }
        
        toggleDayNightButton.addEventListener("click", () => {
            isNightMode = !isNightMode;
            console.log("昼夜設定を変更：", isNightMode ? "O = 夜🌙" : "O = 昼☀️");
            styleToggleButton();
            updateResults();
        });
        
        timeViewButton.addEventListener("click", () => {
            timeViewButton.disabled = true;
            console.log("「時間帯別」ボタンがクリックされました。");
            toggleDayNightButton.style.display = "inline-block";
            updateResults();
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.style.marginBottom = "10px";
        buttonContainer.appendChild(timeViewButton);
        buttonContainer.appendChild(toggleDayNightButton);

        listtableElement.parentNode.insertBefore(buttonContainer, listtableElement);
    }, 500);
});
