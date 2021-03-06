<template>
  <div class="wrapper">
    <div class="code">
      <p>{{sortList}}</p>
      <p>{{filterList}}</p>
      <p>{{filterCheckbox}}</p>
    </div>
    <div class="grid">
      <div class="table-header-wrapper" ref="header"
        @scroll.passive="headerScroll">
        <table class="table-header">
          <thead>
            <th class="header"
              v-for="columnDef in columnDefs"
              :class="{ active: sortKey == columnDef.field }"
              :key="columnDef.field"
            >
             <span
              class="header-name"
              :class="{deactivated: selectedColumnDef}"
              @click="sortBy(columnDef.field)">
                {{ columnDef.headerName | capitalize }}
              </span>
              <span class="arrow"
                :class="{
                  asc: sortList[columnDef.field] === 1,
                  desc: sortList[columnDef.field] === -1
                }">
              </span>
              <span class="open-menu"
                :class="{ hideOption: selectedColumnDef }"
                @click="openMenu(columnDef)"
              ></span>
              <span v-if="filterList[columnDef.field]"
                class="clear-filter"
                :class="{ hideOption: selectedColumnDef }"
                @click="clearFilter(columnDef.field)"
              >X</span>
            </th>
          </thead>
        </table>
      </div>
      <div v-if="isMenuOpen" class="table-filter-wrapper">
        <p class="filter-name">{{selectedColumnDef.headerName}}</p>      
          <div class="filter-sorting">
            <button @click="sortBy(selectedColumnDef.field, 1)"
              :class="{ asc: sortList[selectedColumnDef.field] === 1}">
              Sort A to Z (asc)
            </button>
            <button @click="sortBy(selectedColumnDef.field, -1)"
              :class="{ desc: sortList[selectedColumnDef.field] === -1}">
              Sort Z to A (desc)
            </button>
          </div>
          <div class="filter-input">
            <p>
              <input
                v-model="filterInput"
                v-on:keyup.enter="filterBy(selectedColumnDef.field, filterInput, filterCheckbox)"
                :placeholder="'Filter by ' + selectedColumnDef.headerName">
            </p>
          </div>
          <div v-if="selectedColumnDef.options" class="filter-options">
            <div v-for="item in selectedColumnDef.options.list" class="filter-option"
              :key="item[selectedColumnDef.options.key]">
              <input
                type="checkbox"
                :id="item[selectedColumnDef.options.key]"
                :value="item[selectedColumnDef.options.key]"
                v-model="filterCheckbox">
              <label :for="item[selectedColumnDef.options.key]">{{item[selectedColumnDef.options.value]}}</label>
            </div>
          </div>
          <div class="filter-actions">
            <button @click="clearFilter(selectedColumnDef.field)">Clear Filter</button>
            <button @click="filterBy(selectedColumnDef.field, filterInput, filterCheckbox)" type="submit">Apply Filter</button>
            <button @click="closeMenu">Close</button>
          </div>    
      </div>
      <div class="table-total-wrapper">
        <span>Showing <b>{{filteredData.length}} </b>{{label}}.</span>
      </div>
      <div class="table-body-wrapper" ref="body"
        @scroll.passive="bodyScroll">
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
function getNextOrder(currentFieldOrder){
  if (currentFieldOrder === undefined) return 1;
  if (currentFieldOrder === 1) return -1;
  return undefined;
}

export default {
  name: "Grid",
  props: {
    label: String,
    data: Array,
    columnDefs: Array,
  },
  data(){
    return {
      // menu state
      isMenuOpen: false,
      selectedColumnDef: null,
      // sort state
      sortKey: '',
      sortList: {},
      // filter state
      filterInput: '',
      filterCheckbox: [],
      filterList: {}
    }
  },
  computed: {
    filteredData() {
      const columnDefs = [...this.columnDefs];
      const filterList = {...this.filterList};
      const sortKey = this.sortKey;
      const order = this.sortList[sortKey] || 1;

      let data = [...this.data];

      if (Object.keys(filterList).length) {
        data = data.filter(function (row) {
          return Object.keys(row).some(function (key) {
            if (!Object.prototype.hasOwnProperty.call(filterList, key)) return false;

            const fieldFilter = filterList[key];
            const isFieldFilterArray = Array.isArray(fieldFilter)

            if (isFieldFilterArray) {
              const fieldFilterList = fieldFilter;
              return fieldFilterList.includes(row[key]);
            }

            const columnDef = columnDefs.find(columnDef => columnDef.field === key);
            const {options} = columnDef;
            const fieldFilterLc = (fieldFilter ?? '').toLowerCase();

            if (!options) return String(row[key]).toLowerCase().includes(fieldFilterLc);

            const filterOptionKeys = options.list
              .filter(o => o[options.value].toLowerCase().includes(fieldFilterLc))
              .map(o => o[options.key]);

            return filterOptionKeys.includes(row[key]);
          })
        })
      }

      if (sortKey) {
        data = data.slice().sort(function (a, b) {
          a = a[sortKey];
          b = b[sortKey];
          return (a === b ? 0 : a > b ? 1 : -1) * order;
        })
      }

      return data;
    },
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  },
  methods: {
    sortBy(key, order) {
      if (order === undefined) {
        if (this.selectedColumnDef) return;

        const fieldOrder = this.sortList[key];
        const newFieldOrder = getNextOrder(fieldOrder);

        this.sortKey = key;
        this.sortList = {...this.sortList, [key]: newFieldOrder};
        return;
      }

      if (this.sortList[key] === order) return;

      this.sortKey = key;
      this.sortList = {...this.sortList, [key]: order};
    },
    headerScroll() {
      this.$refs.body.scrollLeft = this.$refs.header.scrollLeft;
    },
    bodyScroll() {
      this.$refs.header.scrollLeft = this.$refs.body.scrollLeft;
    },
    openMenu(columnDef) {
      if (this.isMenuOpen) return;

      this.selectedColumnDef = columnDef;
      const fieldFilter = this.filterList[this.selectedColumnDef.field];
      const isFieldFilterArray = Array.isArray(fieldFilter);

      if (isFieldFilterArray) {
        this.filterCheckbox = fieldFilter;
      } else {
        this.filterInput = fieldFilter;
      }

      this.isMenuOpen = true;
    },
    closeMenu() {
      if (!this.isMenuOpen) return;

      this.isMenuOpen = false;
      this.selectedColumnDef = null;
      this.filterCheckbox = [];
    },
    clearFilter(key) {
      const { [key]: removedValue, ...restFilter }  = this.filterList;
      console.log('clear filter', key, removedValue);
      this.filterList = restFilter;

      this.closeMenu();
    },
    filterBy(key, value, checkIds) {
      if (!value && (checkIds && !checkIds.length)) return;

      this.filterList = {
        ...this.filterList,
        [key]: checkIds && checkIds.length ? checkIds : value
      };

      this.closeMenu();
    },
    renderCell(row, columnDef) {
      const {field, options} = columnDef;
      const rawRowValue = row[field];      
      if (!options) return rawRowValue;

      const item = options.list.find(o => o[options.key] === rawRowValue);
      return !item ? rawRowValue : item[options.value];
    }
  }
}
</script>

<style scoped>
.wrapper {
  width: 700px;
}
.code {
  width: 100%;
  display: none;;
}
.grid {
  width: 700px;
  display: flex;
  flex-direction: column;
  position: relative;
  border: solid 1px #DCDCDC;
}

table {
  border-spacing: 0;
  width: 100%;
}

th {
  color: rgba(147, 185, 213, 0.66);
  background-color: #E8ECF0;
  cursor: pointer;
  user-select: none;
}

td {
  border-bottom: 1px #DCDCDC solid;
}

th, td {
  min-width: 150px;
  padding: 10px 20px;
}

th.header {
  cursor: default;
}
th .header-name {
  cursor: pointer;
}
th .header-name.deactivated {
  cursor: default;
}

th.active {
  color: rgb(147, 185, 213);
}

th.active .arrow {
  opacity: 1;
}

.arrow {
  display: inline-block;
  vertical-align: middle;
  width: 0;
  height: 0;
  margin-left: 5px;
  margin-right: 5px;
  opacity: 0.66;
}

.arrow.asc {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #585B60;
}

.arrow.desc {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #585B60;
}

.open-menu {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: transparent;
  border: 1px solid #585B60;
  cursor: pointer;
}
.clear-filter {
  margin-left: 5px;
  color: #585B60;
  font-size: 15px;
  cursor: pointer;
}
.open-menu.hideOption,
.clear-filter.hideOption {
  visibility: hidden;
  cursor: default;
}

tbody td {
  text-align: left;
}

.table-header-wrapper,
.table-body-wrapper {
  width: 100%;
  overflow: auto;
}
.table-header-wrapper {
  border: 1px #DFE0EE solid;
}
.table-header-wrapper::-webkit-scrollbar {
  display: none;
}
.table-total-wrapper {
  padding: 5px 20px;
  text-align: left;
  background-color: #DCDCDC;
}

.table-body-wrapper {
  height: 600px;
  border: 1px #DCDCDC solid;
}

.table-filter-wrapper {
  position: absolute;
  width: 100%;
  height: calc(100% - 76px);
  top: 76px;
  background-color: white;
}
.table-filter-wrapper .filter-name {
  height: 22px;
  margin: 16px 0;
  font-weight: 600;
}
.table-filter-wrapper .filter-sorting {
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.table-filter-wrapper .filter-sorting button {
  width: 200px;
  border: none;
  background: transparent;
  outline: none;
  height: 16px;
  margin-bottom: 8px;
}
.table-filter-wrapper .filter-sorting button:last-of-type{
  margin-bottom: 0;
}
.table-filter-wrapper .filter-sorting .asc{
  font-weight: 600;
}
.table-filter-wrapper .filter-sorting .desc{
  font-weight: 600;
}

.table-filter-wrapper .filter-input {
    margin: 16px 0;
    height: 22px;
}

.filter-options {
  height: 400px;
  overflow-y: auto;
}
.filter-options .filter-option{
  text-align: left;
  margin-left: 16px;
}

.table-filter-wrapper .filter-actions {
  font-weight: 600;
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
.table-filter-wrapper .filter-actions button {
  margin-right: 16px;
  height: 22px;
}
.table-filter-wrapper .filter-actions button:last-of-type{
  margin-right: 0;
}

.table-header thead {
  display: flex;
}
.table-header .header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>