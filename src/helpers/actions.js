export function filterData(data, filterList, columnDefs) {
  const filteredData = data.filter(function (row) {
    return Object.keys(row).some(function (key) {
      if (!Object.prototype.hasOwnProperty.call(filterList, key)) return false;

      const fieldFilter = filterList[key];
      const isFieldFilterArray = Array.isArray(fieldFilter);

      if (isFieldFilterArray) {
        const fieldFilterList = fieldFilter;
        return fieldFilterList.includes(row[key]);
      }

      const columnDef = columnDefs.find((columnDef) => columnDef.field === key);
      const { options } = columnDef;
      const fieldFilterLc = (fieldFilter ?? "").toLowerCase();

      if (!options)
        return String(row[key]).toLowerCase().includes(fieldFilterLc);

      const filterOptionKeys = options.list
        .filter((o) => o[options.value].toLowerCase().includes(fieldFilterLc))
        .map((o) => o[options.key]);

      return filterOptionKeys.includes(row[key]);
    });
  });

  return filteredData;
}

export function sortData(data, sortKey, order) {
  const sortedData = data.slice().sort(function (a, b) {
    a = a[sortKey];
    b = b[sortKey];
    return (a === b ? 0 : a > b ? 1 : -1) * order;
  });

  return sortedData;
}

export function getNextOrder(currentFieldOrder) {
  if (currentFieldOrder === undefined) return 1;
  if (currentFieldOrder === 1) return -1;
  return undefined;
}
