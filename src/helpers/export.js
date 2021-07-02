export function tableToCSV() {
  const tableHeaders = Array.from(
    document.querySelectorAll(".table-header th .header-name")
  )
    .map((item) => {
      const title = item.innerText
        .split("\n")
        .filter((str) => str !== 0)
        .join(" ");
      return title;
    })
    .join(",");

  const rows = Array.from(document.querySelectorAll(".table-body tr")).reduce(
    (accArr, curRow) => {
      const cells = Array.from(curRow.querySelectorAll("td"))
        .map((item) => item.innerText)
        .join(",");
      return accArr.concat([cells]);
    },
    []
  );

  return tableHeaders + "\n" + rows.join("\n");
}

export function downloadCSV(csvData) {
  const csvFile = new Blob([csvData], { type: "text/csv" });

  const link = document.createElement("a");
  link.download = `csv-${Date.now()}.csv`;
  link.href = window.URL.createObjectURL(csvFile);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
}
