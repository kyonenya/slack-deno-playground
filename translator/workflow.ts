import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

// この定義オブジェクトを manifest.ts で参照するのを忘れずに！
const workflow = DefineWorkflow({
  callback_id: "translator-workflow",
  title: "Translator Workflow",
  input_parameters: {
    properties: {
      // リンクトリガーから受け取るチャンネル ID
      channel_id: { type: Schema.slack.types.channel_id },
      // OpenForm で入力フォームを開くために必要
      interactivity: { type: Schema.slack.types.interactivity },
    },
    required: ["channel_id", "interactivity"],
  },
});

// 標準ファンクションのフォームを使って翻訳対象を取得
const formStep = workflow.addStep(Schema.slack.functions.OpenForm, {
  title: "Run DeepL Translator",
  interactivity: workflow.inputs.interactivity,
  submit_label: "Translate",
  fields: {
    elements: [
      {
        name: "text",
        title: "Text to translate",
        type: Schema.types.string,
      },
      {
        name: "target_lang",
        title: "Target Language",
        type: Schema.types.string,
        description: "Select the language to translate into",
        enum: [
          "English",
          "Japanese",
          "Korean",
          "Chinese",
          "Italian",
          "French",
          "Spanish",
        ],
        choices: [
          { value: "en", title: "English" },
          { value: "ja", title: "Japanese" },
          { value: "kr", title: "Korean" },
          { value: "zh", title: "Chinese" },
          { value: "it", title: "Italian" },
          { value: "fr", title: "French" },
          { value: "es", title: "Spanish" },
        ],
        default: "en",
      },
    ],
    required: ["text", "target_lang"],
  },
});

// 自前の ./function.ts を import してきて、それを使って翻訳
import { def as Translator } from "./function.ts";
const translatorStep = workflow.addStep(Translator, {
  text: formStep.outputs.fields.text,
  target_lang: formStep.outputs.fields.target_lang,
});

// 標準ファンクションで翻訳結果を投稿
workflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: workflow.inputs.channel_id,
  message:
    `>${formStep.outputs.fields.text}\n${translatorStep.outputs.translated_text}`,
});

// default でもそうじゃなくてもどっちでもいい
export default workflow;
