import Vue from "vue";
import VueRouter from "vue-router";
import Deals from "../views/Deals.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Deals",
    component: Deals,
  },
  {
    path: "/documents",
    name: "Documents",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Documents.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
