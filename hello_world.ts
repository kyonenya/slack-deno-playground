// -------------------------
// ワークフロー定義
// -------------------------
import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

const channel_id = "C05STR3J89H";

// この定義オブジェクトを manifest.ts で参照するのを忘れずに！
export const workflow = DefineWorkflow({
  callback_id: "hello-world-workflow",
  title: "Hello World Workflow",
  input_parameters: {
    properties: {},
    required: [],
  },
});

// 標準ファンクションを使ってメッセージを投稿
// channel_id は Slack UI 上から入手してください
workflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id,
  message: "Hello World!",
});

// -------------------------
// トリガー定義
// -------------------------
import { Trigger } from "deno-slack-api/types.ts";

// Incoming Webhooks によるトリガー
const trigger: Trigger<typeof workflow.definition> = {
  type: "webhook",
  name: "Hello World Trigger",
  // 上記のワークフローを参照する必要がある
  workflow: `#/workflows/${workflow.definition.callback_id}`,
  inputs: {},
};

// トリガーの作成には `slack triggers create --trigger-def [ファイルパス]` を実行する
// Trigger 形の定義オブジェクトを export default さえしていれば
// そのソースファイルを使用できる
export default trigger;
