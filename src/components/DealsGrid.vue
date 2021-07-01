<template>
  <GridCompositionAPI
    label="deal(s)"
    :data="gridData"
    :columnDefs="gridColumnDefs"
  ></GridCompositionAPI>
</template>

<script>
import GridCompositionAPI from "./GridCompositionAPI.vue";
import dealsDS from "../data/deals_dataset.json";
import { getDealsDataByKey } from "../helpers/datasource";

const holdings = getDealsDataByKey(dealsDS, "Holdings");
const industries = getDealsDataByKey(dealsDS, "Industries");
const clientIssuers = getDealsDataByKey(dealsDS, "ClientIssuers");
const agents = getDealsDataByKey(dealsDS, "Agents");
const sources = getDealsDataByKey(dealsDS, "Sources");
const dealTypes = getDealsDataByKey(dealsDS, "DealTypes");

export default {
  name: "DealsGrid",
  components: { GridCompositionAPI },
  setup() {
    return {
      gridData: [...holdings],
      gridColumnDefs: [
        { field: "Id", headerName: "Id" },
        { field: "DealName", headerName: "Deal" },
        {
          field: "IssuerId",
          headerName: "Issuer",
          options: {
            list: clientIssuers,
            key: "IssuerId",
            value: "IssuerName",
          },
        },
        {
          field: "IndustryId",
          headerName: "Industry",
          options: {
            list: industries,
            key: "Id",
            value: "IndustryName",
          },
        },
        { field: "Access", headerName: "Access" },
        {
          field: "AgentId",
          headerName: "Agent",
          options: {
            list: agents,
            key: "Id",
            value: "CompanyName",
          },
        },
        {
          field: "SourceId",
          headerName: "Source",
          options: {
            list: sources,
            key: "Id",
            value: "SourceName",
          },
        },
        { field: "DataroomStatusId", headerName: "Dataroom Status" },
        {
          field: "TypeId",
          headerName: "Type",
          options: {
            list: dealTypes,
            key: "Id",
            value: "TypeName",
          },
        },
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
