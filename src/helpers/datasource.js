export function getDealsDataByKey(dealsDS, field) {
  return dealsDS?.data?.[field] ?? [];
}

export function getDocsDataByKey(docsDS, field) {
  return docsDS?.data?.[field] ?? [];
}
