<template>
  <editor
    :id="id"
    :inline="true"
    @onInit="handleInit"
    :value="parsedValue"
    :init="config"
    @onBeforeAddUndo="handleBeforeAddUndo"
    ref="zcoInput"
  />
</template>

<script>
const ZCO_TAG = `<span class="mceNonEditable el-tag el-tag--info el-tag--light">ZCO_TAG_TEXT1<span class="mce-hide">ZCO_TAG_TEXT2</span>}}</span>`;

import { mapState, mapActions } from "vuex";
import tinymce from "tinymce"; // tinymce.min.js
import Editor from "@tinymce/tinymce-vue";
// We're manually importing theme, icons and plugins because otherwise TinyMCE tries to resolve
// them himself and load throught http, but this won't work with chrome extension
// Theme
import "tinymce/themes/silver/theme.min.js";
import "tinymce/models/dom/model.js";
import "tinymce/icons/default/icons.js";
/* Import content css */
import contentUiCss from "tinymce/skins/ui/oxide/content.css";
import contentCss from "tinymce/skins/content/default/content.css";
const config = {
  height: "36",
  min_height: 36,
  menubar: false,
  plugins: [], // wordcount
  toolbar: false,
  inline: true,
  noneditable_class: "mceNonEditable",
  skin: false,
  content_css: false,
  content_style: contentUiCss.toString() + "\n" + contentCss.toString(),
  nowrap: true,
  force_root_block: '',
};

window.tinymce = tinymce;

export default {
  components: { Editor },
  props: {
    value: {
      type: String,
      default: () => "",
    },
    id: {
      type: String,
      default: () => "",
    },
    required: {
      type: Boolean,
      default: () => false,
    },
    minlength: {
      type: Number,
      default: () => 1,
    },
    maxlength: {
      type: Number,
      default: () => 140,
    },
    showDetail: {
      type: Boolean,
      default: () => false,
    },
    placeholder: {
      type: String,
      default: () => "",
    },
    autosize: {
      type: Object,
      default: () => ({ minRows: 1.1, maxRows: 3 }),
    },
  },
  watch: {
    insert(newVal) {
      const { id, variable } = newVal || {};
      if (id === this.$refs.zcoInput.id) {
        this.insertKeyword(variable);
      }
    },
  },

  computed: {
    ...mapState({
      insert: (state) => state.variable.insert,
    }),
  },

  data() {
    return {
      editor: null,
      config: { ...config, placeholder: this.placeholder },
      parsedValue: "",
    };
  },

  mounted() {
    // console.log("mounted", this.value);
  },
  beforeDestroy() {},

  methods: {
    ...mapActions("variable", ["setInsertVariable"]),

    handleInit(evt, editor) {
      this.editor = editor;
      this.$nextTick(() => {
        this.parse(this.value);
      });
      editor.on("change input", () => {
        this.handleUpdate(editor.getContent({ format: 'text' }));
      });
      editor.on("keydown", function (e) {
        return e.keyCode != 13;
      });
    },

    handleUpdate(value) {
      if (!value) {
        return;
      }
      const length = this.editor.getContent({ format: "text" }).length;
      if (this.maxlength && length <= this.maxlength) {
        //   setEditorText(value);
        this.$emit("input", { value, id: this.id });
      }
    },

    handleBeforeAddUndo(evt) {
      const length = this.editor.getContent({ format: "text" }).length;
      // note that this is the opposite test as in handleUpdate
      // because we are determining when to deny adding an undo level
      if (this.maxlength && length > this.maxlength) {
        evt.preventDefault();
      }
    },

    parse(str) {
      if (!str) {
        return;
      }
      const pattern = /({{[^{}]+}})|([^{}]+)/g;

      const matches = str.match(pattern);

      const result = matches.map((match) => {
        if (match.startsWith("{{") && match.endsWith("}}")) {
          // const text = match.slice(2, -2);
          return { text: match, type: "key" };
        } else {
          return { text: match, type: "text" };
        }
      });
      result.map((item) => {
        if (item.type === "key") {
          this.insertKeyword(item.text);
        } else {
          this.insertText(item.text);
        }
      });
    },

    insertText(insertText) {
      if (insertText && this.editor) {
        this.editor.execCommand("mceInsertContent", false, insertText);
      }
    },

    insertKeyword(insertText) {
      if (insertText && this.editor) {
        let tag = this.formatTag(insertText);
        this.editor.execCommand("mceInsertContent", false, tag);
      }
    },

    formatTag(text) {
      let tag = ZCO_TAG;
      let subs = text.split("_");
      const text2 = "_" + subs[subs.length - 1].split("}")[0];
      subs.splice(subs.length - 1, 1);
      let text1 = subs.join("_");
      tag = tag.replace(/ZCO_TAG_TEXT1/g, text1);
      tag = tag.replace(/ZCO_TAG_TEXT2/g, text2);
      return tag;
    },
  },
};
</script>

<style lang="less">
.mce-hide {
  /* visibility: hidden; */
  color: #fff;
  width: 0;
  max-width: 0;
  height: 0;
  max-height: 0;
  display: inline-flex;
}
.mce-content-body {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 15px;
  height: 36px;
  outline: none;
  max-height: 36px;
  background: #ffffff;
  line-height: 36px;
  box-sizing: border-box;
  font-size: 14px;
  overflow: hidden;
  white-space: normal;

  p {
    margin: 0;
    padding: 0;
    white-space: nowrap;
  }

  .el-tag.el-tag--info {
    margin: 0 2px 9px 2px;
  }
}
.mce-content-body:not([dir="rtl"])[data-mce-placeholder]:not(
    .mce-visualblocks
  )::before {
  left: 15px;
}
</style>
