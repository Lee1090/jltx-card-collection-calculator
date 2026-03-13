function calculate() {

    let text = document.getElementById("input").value.trim();

    if (text === "") {
        document.getElementById("result").innerText = "No input";
        return;
    }

    // 按换行拆分
    let rows = text.split("\n");

    let output = "Parsed result:\n\n";

    rows.forEach((row, rowIndex) => {

        // 按空格拆分
        let numbers = row.trim().split(/\s+/);

        output += "Row " + (rowIndex + 1) + ": ";

        numbers.forEach(num => {
            output += num + " ";
        });

        output += "\n";

    });

    document.getElementById("result").innerText = output;

}
