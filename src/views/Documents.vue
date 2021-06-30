<template>
  <div class="documents">
    <HelloWorld msg="Documents" />
    <DocumentsGrid></DocumentsGrid>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import DocumentsGrid from "@/components/DocumentsGrid.vue";

export default {
  name: "Documents",
  components: {
    HelloWorld,
    DocumentsGrid,
  },
};
</script>
