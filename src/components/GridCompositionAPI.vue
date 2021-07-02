<template>
  <div class="wrapper">
    <p>Composition API</p>
    <div class="code">
      <p>{{ sortList }}</p>
      <p>{{ filterList }}</p>
      <p>{{ filterCheckbox }}</p>
    </div>
    <div class="grid">
      <div
        class="table-header-wrapper"
        ref="headerRef"
        @scroll.passive="headerScroll"
      >
        <table class="table-header">
          <thead>
            <th
              class="header"
              v-for="columnDef in columnDefs"
              :class="{ active: sortKey == columnDef.field }"
              :key="columnDef.field"
            >
              <span
                class="header-name"
                :class="{ deactivated: selectedColumnDef }"
                @click="sortBy(columnDef.field)"
              >
                {{ columnDef.headerName }}
              </span>
              <span
                class="arrow"
                :class="{
                  asc: sortList[columnDef.field] === 1,
                  desc: sortList[columnDef.field] === -1,
                }"
              >
              </span>
              <span
                class="open-menu"
                :class="{ hideOption: selectedColumnDef }"
                @click="openMenu(columnDef)"
              ></span>
              <span
                v-if="filterList[columnDef.field]"
                class="clear-filter"
                :class="{ hideOption: selectedColumnDef }"
                @click="clearFilter(columnDef.field)"
              >
                X
              </span>
            </th>
          </thead>
        </table>
      </div>
      <div v-if="isMenuOpen" class="table-filter-wrapper">
        <p class="filter-name">{{ selectedColumnDef.headerName }}</p>
        <div class="filter-sorting">
          <button
            @click="sortBy(selectedColumnDef.field, 1)"
            :class="{ asc: sortList[selectedColumnDef.field] === 1 }"
          >
            Sort A to Z (asc)
          </button>
          <button
            @click="sortBy(selectedColumnDef.field, -1)"
            :class="{ desc: sortList[selectedColumnDef.field] === -1 }"
          >
            Sort Z to A (desc)
          </button>
        </div>
        <div class="filter-input">
          <p>
            <input
              v-model="filterInput"
              v-on:keyup.enter="
                filterBy(selectedColumnDef.field, filterInput, filterCheckbox)
              "
              :placeholder="'Filter by ' + selectedColumnDef.headerName"
            />
          </p>
        </div>
        <div v-if="selectedColumnDef.options" class="filter-options">
          <div
            v-for="item in selectedColumnDef.options.list"
            class="filter-option"
            :key="item[selectedColumnDef.options.key]"
          >
            <input
              type="checkbox"
              :id="item[selectedColumnDef.options.key]"
              :value="item[selectedColumnDef.options.key]"
              v-model="filterCheckbox"
            />
            <label :for="item[selectedColumnDef.options.key]">{{
              item[selectedColumnDef.options.value]
            }}</label>
          </div>
        </div>
        <div class="filter-actions">
          <button
            @click="clearFilter(selectedColumnDef.field)"
            class="clear-filter"
          >
            Clear Filter
          </button>
          <button
            @click="
              filterBy(selectedColumnDef.field, filterInput, filterCheckbox)
            "
            class="apply-filter"
            type="submit"
          >
            Apply Filter
          </button>
          <button @click="closeMenu" class="close-filter">Close</button>
        </div>
      </div>
      <div class="table-total-wrapper">
        <span>
          Showing <b>{{ filteredData.length }} </b>{{ label }}.
        </span>
        <div class="table-actions">
          <button :disabled="!filteredData.length" @click="exportToCSV">
            Export
          </button>
        </div>
      </div>
      <div
        class="table-body-wrapper"
        ref="bodyRef"
        @scroll.passive="bodyScroll"
      >
        <table class="table-body">
          <tbody>
            <tr v-for="row in filteredData" :key="row.Id">
              <td v-for="columnDef in columnDefs" :key="columnDef.field">
                {{ renderCell(row, columnDef) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "@vue/composition-api";
import { tableToCSV, downloadCSV } from "../helpers/export";
import { getNextOrder, filterData, sortData } from "../helpers/actions";

export default {
  name: "GridCompositionAPI",
  props: {
    label: String,
    data: Array,
    columnDefs: Array,
  },
  setup(props) {
    // menu state
    const isMenuOpen = ref(false);
    const selectedColumnDef = ref(null);
    // sort state
    const sortKey = ref("");
    const sortList = ref({});
    // filter state
    const filterInput = ref("");
    const filterCheckbox = ref([]);
    const filterList = ref({});
    // div ref
    const bodyRef = ref(null);
    const headerRef = ref(null);

    const filteredData = computed(() => {
      const columnDefs = [...props.columnDefs];
      let data = [...props.data];

      const _filterList = filterList.value;
      const _sortKey = sortKey.value;
      const order = sortList.value[_sortKey] || 1;

      if (Object.keys(_filterList).length) {
        data = filterData(data, _filterList, columnDefs);
      }

      if (_sortKey) {
        data = sortData(data, _sortKey, order);
      }

      return data;
    });

    function sortBy(key, order) {
      if (order === undefined) {
        if (selectedColumnDef.value) return;

        const fieldOrder = sortList.value[key];
        const newFieldOrder = getNextOrder(fieldOrder);

        sortKey.value = key;
        sortList.value = {
          ...sortList.value,
          [key]: newFieldOrder,
        };
        return;
      }

      if (sortList.value[key] === order) return;

      sortKey.value = key;
      sortList.value = {
        ...sortList.value,
        [key]: order,
      };
    }

    function headerScroll() {
      bodyRef.value.scrollLeft = headerRef.value.scrollLeft;
    }

    function bodyScroll() {
      headerRef.value.scrollLeft = bodyRef.value.scrollLeft;
    }

    function openMenu(columnDef) {
      if (isMenuOpen.value) return;

      selectedColumnDef.value = columnDef;
      const fieldFilter = filterList.value[selectedColumnDef.value.field];
      const isFieldFilterArray = Array.isArray(fieldFilter);

      if (isFieldFilterArray) {
        filterCheckbox.value = fieldFilter;
      } else {
        filterInput.value = fieldFilter;
      }

      isMenuOpen.value = true;
    }

    function closeMenu() {
      if (!isMenuOpen.value) return;

      isMenuOpen.value = false;
      selectedColumnDef.value = null;
      filterCheckbox.value = [];
    }

    function clearFilter(key) {
      const { [key]: removedValue, ...restFilter } = filterList.value; // eslint-disable-line
      filterList.value = restFilter;

      closeMenu();
    }

    function filterBy(key, value, checkIds) {
      if (!value && checkIds && !checkIds.length) return;

      filterList.value = {
        ...filterList.value,
        [key]: checkIds && checkIds.length ? checkIds : value,
      };

      closeMenu();
    }

    function renderCell(row, columnDef) {
      const { field, options } = columnDef;
      const rawRowValue = row[field];
      if (!options) return rawRowValue;

      const item = options.list.find((o) => o[options.key] === rawRowValue);
      return !item ? rawRowValue : item[options.value];
    }

    function exportToCSV() {
      const csvData = tableToCSV();

      downloadCSV(csvData);
    }

    return {
      // state
      isMenuOpen,
      selectedColumnDef,
      sortKey,
      sortList,
      filterInput,
      filterCheckbox,
      filterList,
      // ref
      bodyRef,
      headerRef,
      // methods
      filteredData,
      sortBy,
      headerScroll,
      bodyScroll,
      openMenu,
      closeMenu,
      clearFilter,
      filterBy,
      renderCell,
      exportToCSV,
    };
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 700px;

  .code {
    width: 100%;
    display: none;
  }

  .grid {
    width: 700px;
    display: flex;
    flex-direction: column;
    position: relative;
    border: solid 1px #dcdcdc;

    table {
      border-spacing: 0;
      width: 100%;

      th {
        color: rgba(147, 185, 213, 0.66);
        background-color: #e8ecf0;
        cursor: pointer;
        user-select: none;
      }

      td {
        border-bottom: 1px #dcdcdc solid;
      }

      th,
      td {
        min-width: 150px;
        padding: 10px 20px;
      }

      th {
        &.header {
          cursor: default;
        }

        &.active {
          color: rgb(147, 185, 213);

          .arrow {
            opacity: 1;
          }
        }
      }

      tbody td {
        text-align: left;
      }
    }

    .table-header-wrapper,
    .table-body-wrapper {
      width: 100%;
      overflow: auto;
    }

    .table-header-wrapper {
      border: 1px #dfe0ee solid;

      &::-webkit-scrollbar {
        display: none;
      }

      .table-header {
        thead {
          display: flex;
        }

        .header {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }

        .header-name {
          cursor: pointer;

          &.deactivated {
            cursor: default;
          }
        }

        .arrow {
          display: inline-block;
          vertical-align: middle;
          width: 0;
          height: 0;
          margin-left: 5px;
          margin-right: 5px;
          opacity: 0.66;

          &.asc {
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 6px solid #585b60;
          }

          &.desc {
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #585b60;
          }
        }

        .open-menu {
          display: inline-block;
          width: 10px;
          height: 10px;
          background: transparent;
          border: 1px solid #585b60;
          cursor: pointer;

          &.hideOption {
            visibility: hidden;
            cursor: default;
          }
        }

        .clear-filter {
          margin-left: 5px;
          color: #585b60;
          font-size: 15px;
          cursor: pointer;

          &.hideOption {
            visibility: hidden;
            cursor: default;
          }
        }
      }
    }

    .table-filter-wrapper {
      position: absolute;
      width: 100%;
      height: calc(100% - 76px);
      top: 76px;
      background-color: white;

      .filter-name {
        height: 22px;
        margin: 16px 0;
        font-weight: 600;
        color: #6a6f66;
      }
      .filter-sorting {
        font-weight: 600;
        display: flex;
        flex-direction: column;
        align-items: center;

        button {
          width: 200px;
          border: none;
          background: transparent;
          outline: none;
          height: 16px;
          margin-bottom: 8px;
          color: #7992a5;

          &:last-of-type {
            margin-bottom: 0;
          }
        }

        .asc,
        .desc {
          font-weight: 600;
        }
      }

      .filter-input {
        margin: 16px 0;
        height: 22px;
      }

      .filter-options {
        height: 400px;
        overflow-y: auto;

        .filter-option {
          text-align: left;
          margin-left: 16px;

          label {
            color: #7992a5;
            font-weight: 600;
          }
        }
      }

      .filter-actions {
        font-weight: 600;
        display: flex;
        justify-content: center;
        margin: 16px 0;

        button {
          margin-right: 16px;
          height: 22px;
          font-weight: 600;

          &.clear-filter {
            color: #f9efdd;
            background-color: #dfab55;
            border: solid 1px #dfab55;
          }

          &.apply-filter {
            color: #f9efdd;
            background-color: #639dd8;
            border: solid 1px #242424;
          }

          &.close-filter {
            color: #4a4a4a;
            background-color: #fcfcfc;
            border: solid 1px #d8d8d8;
          }

          &:last-of-type {
            margin-right: 0;
          }
        }
      }
    }

    .table-total-wrapper {
      display: flex;
      justify-content: space-between;
      padding: 5px 20px;
      background-color: #dcdcdc;

      .table-actions {
        button {
          font-weight: 600;
          color: #4a4a4a;
          background-color: #fcfcfc;
          border: solid 1px #d8d8d8;
          margin-right: 8px;

          &:disabled {
            opacity: 0.66;
          }

          &:last-of-type {
            margin-right: 0;
          }
        }
      }
    }

    .table-body-wrapper {
      height: 600px;
      border: 1px #dcdcdc solid;
    }
  }
}
</style>
