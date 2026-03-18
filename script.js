const HERO_NAMES = [
    "青云剑侠",
    "天下归心",
    "比翼同心",
    "草船借箭",
    "北斗贪狼",
    "绝世风华",
    "盛世烟云",
    "瑶池仙子",
    "墨守城归",
    "笔伐天下"
];
function clearMessage() {
    document.getElementById("message").innerHTML = "";
}

function showMessage(text, type) {
    document.getElementById("message").innerHTML =
        `<div class="message ${type}">${text}</div>`;
}

function clearInput() {
    document.getElementById("input").value = "";

    // 清空初始碎片输入框，恢复默认值 0
    const initialFragmentsEl = document.getElementById("initialFragments");
    if (initialFragmentsEl) {
        initialFragmentsEl.value = "0";
    }

    document.getElementById("result").innerHTML = "";
    clearMessage();
}

function isValidTernaryCard(value) {
    return /^[012]{4}$/.test(value);
}

function isValidNonNegativeInteger(value) {
    return /^\d+$/.test(String(value).trim());
}

/**
 * 将 4 位三进制字符串转换为十进制
 * 例如：2101(3) => 64
 */
function ternaryToDecimal(card) {
    return parseInt(card, 3);
}

/**
 * 解析并校验输入内容
 * 返回：
 * {
 *   parsedRows: 二维数组（用于按原表格展示）
 *   cards: 扁平数组（用于排序和算法处理）
 * }
 */
function parseInputText(input) {
    const rows = input.split(/\r?\n/).filter(row => row.trim() !== "");

    if (rows.length !== 10) {
        throw new Error(`Input must contain exactly 10 rows. Current rows: ${rows.length}.`);
    }

    const parsedRows = [];
    const cards = [];

    for (let i = 0; i < rows.length; i++) {
        const rowText = rows[i].trim();
        const numbers = rowText.split(/\s+/);

        if (numbers.length !== 5) {
            throw new Error(`Row ${i + 1} must contain exactly 5 numbers. Current count: ${numbers.length}.`);
        }

        const currentRow = [];

        for (let j = 0; j < numbers.length; j++) {
            const value = numbers[j];

            if (!isValidTernaryCard(value)) {
                throw new Error(
                    `Row ${i + 1}, Column ${j + 1} is invalid: "${value}". Each value must be a 4-digit ternary number using only 0, 1, and 2.`
                );
            }

            const decimalValue = ternaryToDecimal(value);

            // 每张卡都保留原始位置，便于最后按原表格回填显示
            const card = {
                raw: value,
                decimal: decimalValue,
                disassembleGain: decimalValue,
                composeCost: 243 - 3 * decimalValue,
                row: i,
                col: j,
                state: "unused" // 初始状态：未成
            };

            currentRow.push(card);
            cards.push(card);
        }

        parsedRows.push(currentRow);
    }

    return { parsedRows, cards };
}

/**
 * 校验并读取初始碎片数
 */
function getInitialFragments() {
    const initialFragmentsEl = document.getElementById("initialFragments");

    // 如果页面上还没加这个输入框，这里默认按 0 处理，避免报错
    if (!initialFragmentsEl) {
        return 0;
    }

    const value = initialFragmentsEl.value.trim();

    if (!isValidNonNegativeInteger(value)) {
        throw new Error("Initial fragments must be a non-negative integer.");
    }

    return Number(value);
}

/**
 * 核心贪心算法
 * 目标：最大化最终成功合成的卡数量
 *
 * 思路：
 * 1. 所有卡按十进制值从小到大排序
 * 2. 优先尝试合成最大的卡（因为它合成成本最低）
 * 3. 如果碎片不够，则分解最小的卡来补碎片池
 * 4. 重复直到无法继续
 */
function runGreedyStrategy(cards, initialFragments) {
    // 复制数组，避免直接打乱原数组顺序
    const sortedCards = [...cards].sort((a, b) => a.decimal - b.decimal);

    let left = 0;
    let right = sortedCards.length - 1;
    let pool = initialFragments;

    let composedCount = 0;
    let disassembledCount = 0;
    let totalDisassembleGain = 0;
    let totalComposeSpent = 0;

    while (left <= right) {
        // 只剩最后一张卡时，不能既拆它又合它
        if (left === right) {
            const targetCard = sortedCards[right];

            if (pool >= targetCard.composeCost) {
                targetCard.state = "compose";
                pool -= targetCard.composeCost;
                composedCount++;
                totalComposeSpent += targetCard.composeCost;
            } else {
                targetCard.state = "unused";
            }

            break;
        }

        const largestCard = sortedCards[right];

        // 如果当前碎片池足够，则优先合成当前最大的卡
        if (pool >= largestCard.composeCost) {
            largestCard.state = "compose";
            pool -= largestCard.composeCost;
            composedCount++;
            totalComposeSpent += largestCard.composeCost;
            right--;
        } else {
            // 碎片不够，则分解当前最小的卡来补碎片池
            const smallestCard = sortedCards[left];
            smallestCard.state = "disassemble";
            pool += smallestCard.disassembleGain;
            disassembledCount++;
            totalDisassembleGain += smallestCard.disassembleGain;
            left++;
        }
    }

    return {
        composedCount,
        disassembledCount,
        remainingFragments: pool,
        totalFragmentsAvailable: initialFragments + totalDisassembleGain,
        totalDisassembleGain,
        totalComposeSpent
    };
}

/**
 * 将状态转换成页面显示文字
 */
function getStateLabel(state) {
    switch (state) {
        case "compose":
            return "合";
        case "disassemble":
            return "拆";
        default:
            return "未成";
    }
}

/**
 * 给状态附带 css class，方便你后面做颜色区分
 */
function getStateClass(state) {
    switch (state) {
        case "compose":
            return "state-compose";
        case "disassemble":
            return "state-disassemble";
        default:
            return "state-unused";
    }
}

/**
 * 渲染结果表格 + 统计信息
 */
function renderResult(parsedRows, stats, initialFragments) {
    const resultEl = document.getElementById("result");

    let html = `
        <div class="stats-block">
            <h3>Summary</h3>
            <div>Initial Fragments: ${initialFragments}</div>
            <div>Composed Cards: ${stats.composedCount}</div>
            <div>Remaining Fragments: ${stats.remainingFragments}</div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Row</th>
                    <th>C1</th>
                    <th>C2</th>
                    <th>C3</th>
                    <th>C4</th>
                    <th>C5</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < parsedRows.length; i++) {
        const heroName = HERO_NAMES[i] || "";
        html += `
            <tr>
                <td class="row-header-cell">
                    <div class="row-number">${i + 1}</div>
                    <div class="hero-name">${heroName}</div>
                </td>
        `;

        for (let j = 0; j < parsedRows[i].length; j++) {
            const card = parsedRows[i][j];
            const stateLabel = getStateLabel(card.state);
            const stateClass = getStateClass(card.state);

            html += `
                <td>
                    <div class="card-value">${card.raw}</div>
                    <div class="card-state ${stateClass}">${stateLabel}</div>
                </td>
            `;
        }

        html += `</tr>`;
    }

    html += `
            </tbody>
        </table>
    `;

    resultEl.innerHTML = html;
}

function calculate() {
    const input = document.getElementById("input").value.trim();

    clearMessage();
    document.getElementById("result").innerHTML = "";

    if (input === "") {
        showMessage("Please paste your card data first.", "error");
        return;
    }

    try {
        // 1. 解析并校验卡片输入
        const { parsedRows, cards } = parseInputText(input);

        // 2. 读取并校验初始碎片数
        const initialFragments = getInitialFragments();

        // 3. 执行贪心算法
        const stats = runGreedyStrategy(cards, initialFragments);

        // 4. 渲染结果
        renderResult(parsedRows, stats, initialFragments);

        showMessage("Input is valid. Calculation completed.", "success");
    } catch (error) {
        showMessage(error.message || "Calculation failed.", "error");
    }
}
