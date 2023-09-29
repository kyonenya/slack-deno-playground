// -------------------------
// ワークフロー定義
// -------------------------
import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

// この定義オブジェクトを manifest.ts で参照するのを忘れずに！
export const workflow = DefineWorkflow({
  callback_id: "hello-world-workflow",
  title: "Hello World Workflow",
  input_parameters: {
    properties: {
      // リンクトリガーから受け取るチャンネル ID
      channel_id: { type: Schema.slack.types.channel_id },
    },
    required: ["channel_id"],
  },
});

// 前回の記事で見た標準ファンクションを使った例
// workflow.addStep(Schema.slack.functions.SendMessage, {
//  channel_id: workflow.inputs.channel_id,
//  message: "Hello World!",
//});

// 自前の ./my_send_message.ts を import してきて、それを使ってメッセージを投稿
import { def as MySendMessage } from "./my_send_message.ts";
workflow.addStep(MySendMessage, {
  // ワークフロー全体のトリガーからの入力を指定
  // リンクトリガーの場合はそれを起動したチャンネルの ID が渡される
  channel_id: workflow.inputs.channel_id,
  message: "Hello World!",
});

// -------------------------
// トリガー定義
// -------------------------
import { Trigger } from "deno-slack-api/types.ts";

// リンクトリガー
const trigger: Trigger<typeof workflow.definition> = {
  type: "shortcut",
  name: "Hello World Trigger",
  workflow: `#/workflows/${workflow.definition.callback_id}`,
  inputs: {
    // クリックしたチャンネルの ID が設定される
    channel_id: { value: "{{data.channel_id}}" },
  },
};

// トリガーの作成には `slack triggers create --trigger-def [ファイルパス]` を実行する
// Trigger 形の定義オブジェクトを export default さえしていれば
// そのソースファイルを使用できる
export default trigger;
