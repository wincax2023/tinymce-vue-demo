import Vue from 'vue';
import Vuex from 'vuex';
import variable from './modules/variable';


Vue.use(Vuex);


const store = new Vuex.Store({
	// 严格模式，必须使用 mutations 修改，不能直接复制修改
	strict: true,
	modules: {
		variable
	},
	plugins: []
});

// 为了解决npm方式store共享的问题
window.store = store;
export default store;
