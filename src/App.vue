 <template>
   <div id="app">
     <TinymceInput
        :id="ids[0]"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :showDetail="showDetail"
        :required="required"
        :value="content[ids[0]]"
        :autosize="autosize"
        @input="onInput"
     />
     <el-divider></el-divider>
     <TinymceInput
        :id="ids[1]"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :showDetail="showDetail"
        :required="required"
        :value="content[ids[1]]"
        :autosize="autosize"
        @input="onInput"
     />
     <el-divider></el-divider>
     <TinymceInput
        :id="ids[2]"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :showDetail="showDetail"
        :required="required"
        :value="content[ids[2]]"
        :autosize="autosize"
        @input="onInput"
     />
     <el-divider></el-divider>
     <el-button @click="onInsert">插入标签</el-button>
   </div>
 </template>

 <script>
import { mapActions } from "vuex";
import TinymceInput from './components/TinymceInput.vue';

 export default {
   name: 'app',
   components: {
    TinymceInput
   },
   data() {
    return {
      content: {'textarea-1': '123', 'textarea-2': '456', 'textarea-3': '11{{客户_访客_姓名_123}}33{{客户_访客_姓名_123}}33' },
      autosize: {
        minRows: 1.1,
        maxRows: 3
      },
      placeholder: '输入内容',
      maxlength: 2000,
      ids: ['textarea-1', 'textarea-2', 'textarea-3'],
      required: true,
      showDetail: false,
      tag: '{{客户_访客_姓名_123}}',
    };
  },
  mounted() {
    console.log("mounted", this.content[this.ids[0]]);
  },
  methods: {
    ...mapActions("variable", ["setInsertVariable"]),
    onInput({id, value}) {
      console.log('onInput', value);
      this.content[id] = value;
    },
    onInsert() {
      this.setInsertVariable({variable: this.tag, id: this.ids[0]});
    }
  }

 }
 </script>
