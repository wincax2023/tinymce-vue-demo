import Vue from 'vue'
import ElementUI from 'element-ui';
import App from './App.vue'
import store from './store/index';
import 'element-ui/lib/theme-chalk/index.css';


Vue.config.productionTip = false
Vue.use(ElementUI);


new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
