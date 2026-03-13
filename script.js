function clearMessage() {
    document.getElementById("message").innerHTML = "";
}

function showMessage(text, type) {
    document.getElementById("message").innerHTML =
        `<div class="message ${type}">${text}</div>`;
}

function clearInput() {
    document.getElementById("input").value = "";
    document.getElementById("result").innerHTML = "";
    clearMessage();
}

function isValidTernaryCard(value) {
    return /^[012]{4}$/.test(value);
}

function calculate() {
    const input = document.getElementById("input").value.trim();
    const resultEl = document.getElementById("result");

    resultEl.innerHTML = "";
    clearMessage();

    if (input === "") {
        showMessage("Please paste your card data first.", "error");
        return;
    }

    const rows = input.split(/\r?\n/).filter(row => row.trim() !== "");

    if (rows.length !== 10) {
        showMessage(`Input must contain exactly 10 rows. Current rows: ${rows.length}.`, "error");
        return;
    }

    const parsedRows = [];

    for (let i = 0; i < rows.length; i++) {
        const rowText = rows[i].trim();
        const numbers = rowText.split(/\s+/);

        if (numbers.length !== 5) {
            showMessage(`Row ${i + 1} must contain exactly 5 numbers. Current count: ${numbers.length}.`, "error");
            return;
        }

        for (let j = 0; j < numbers.length; j++) {
            const value = numbers[j];

            if (!isValidTernaryCard(value)) {
                showMessage(
                    `Row ${i + 1}, Column ${j + 1} is invalid: "${value}". Each value must be a 4-digit ternary number using only 0, 1, and 2.`,
                    "error"
                );
                return;
            }
        }

        parsedRows.push(numbers);
    }

    showMessage("Input is valid. Showing preview below.", "success");

    let html = `
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
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${parsedRows[i][0]}</td>
                <td>${parsedRows[i][1]}</td>
                <td>${parsedRows[i][2]}</td>
                <td>${parsedRows[i][3]}</td>
                <td>${parsedRows[i][4]}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    resultEl.innerHTML = html;
}
