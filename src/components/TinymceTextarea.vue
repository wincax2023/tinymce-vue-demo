<template>
  <editor
    :id="id"
    :inline="true"
    @onInit="handleInit"
    :value="parsedValue"
    :init="config"
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
  height: "200",
  min_height: 200,
  menubar: false,
  plugins: [], // wordcount
  toolbar: false,
  inline: true,
  noneditable_class: "mceNonEditable",
  skin: false,
  content_css: false,
  content_style: contentUiCss.toString() + "\n" + contentCss.toString(),
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
      config: {
        ...config,
        placeholder: this.placeholder,
        max_chars: this.maxlength,
      },
      parsedValue: "",
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.parse(this.value);
    });
  },
  beforeDestroy() {},

  methods: {
    ...mapActions("variable", ["setInsertVariable"]),

    handleInit(evt, editor) {
      console.log("handleInit", evt, editor);
      var allowedKeys = [
        8, 13, 16, 17, 18, 20, 33, 34, 35, 36, 37, 38, 39, 40, 46,
      ];
      this.editor = editor;
      this.$nextTick(() => {
        this.parse(this.value);
      });
      editor.on("change input", () => {
        this.handleUpdate(editor.getContent({ format: "text" }));
      });
      editor.on("keydown KeyUp Undo Redo", (e) => {
        if (allowedKeys.indexOf(e.keyCode) != -1) return true;
        if (editor.getContent({ format: "text" }).length + 1 > this.maxlength) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        return true;
      });
    },

    handleUpdate(value) {
      if (!value) {
        return;
      }
      const length = value.length;
      if (this.maxlength && length <= this.maxlength) {
        //   setEditorText(value);
        this.$emit("input", { value, id: this.id });
      } else {
        this.parsedValue = value.substring(0, this.maxlength);
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
        const length = this.editor.getContent({ format: "text" }).length;
        if (length + insertText.length > this.maxlength) {
          insertText = insertText.substring(0, this.maxlength - length);
        }
        this.editor.execCommand("mceInsertContent", false, insertText);
      }
    },

    insertKeyword(insertText) {
      if (insertText && this.editor) {
        const length = this.editor.getContent({ format: "text" }).length;
        if (length + insertText.length > this.maxlength) {
          return;
        }
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
      console.log("formatTag", subs, text1, text2);
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
  height: fit-content;
  outline: none;
  max-height: 120px;
  overflow-y: auto;
  background: #ffffff;
  word-break: break-all;
  line-height: 26px;
  box-sizing: border-box;
  font-size: 14px;

  p {
    margin: 0;
    padding: 0;
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
.mce-content-body:focus {
  border-color: #409eff !important;
  outline: none;
}
</style>
