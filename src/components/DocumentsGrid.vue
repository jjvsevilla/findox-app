<template>
  <Grid
    label="document(s)"
    :data="gridData"
    :columnDefs="gridColumnDefs"
  ></Grid>
</template>

<script>
import Grid from "./Grid.vue";
import docsDS from "../data/docs_dataset.json";
import { getDealsDataByKey } from "../helpers/datasource";

const holdings = getDealsDataByKey(docsDS, "docs")

export default {
  name: "DocumentsGrid",
  components: { Grid },
  data() {
    return {
      gridData: [...holdings],
      gridColumnDefs: [
        { field: "id", headerName: "Id" },
        { field: "folder_path", headerName: "Path" },
        { field: "doc_name", headerName: "Document Name" },
        { field: "display_extension", headerName: "Extension" },
        { field: "size", headerName: "Size" },
      ],
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
