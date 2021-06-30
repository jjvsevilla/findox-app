<template>
  <div class="deals">
    <HelloWorld msg="Deals" />
    <DealsGrid></DealsGrid>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import DealsGrid from "@/components/DealsGrid.vue";

export default {
  name: "Deals",
  components: {
    HelloWorld,
    DealsGrid,
  },
};
</script>
