export const types = {
	SET_INSERT_VARIABLE: 'variable/SET_INSERT_VARIABLE',

};

export default {
	namespaced: true,
	state: {
		insert: {id: '', variable: ''}, // 插入的变量

	},
	mutations: {
		[types.SET_INSERT_VARIABLE](state, variable) {
			state.insert = {...variable};
		},
	},
	actions: {
		setInsertVariable({ commit }, variable) {
			commit(types.SET_INSERT_VARIABLE, variable);
		},
		
	},

};
