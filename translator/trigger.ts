import { Trigger } from "deno-slack-api/types.ts";
import workflow from "./workflow.ts";

const trigger: Trigger<typeof workflow.definition> = {
  // リンクトリガー
  type: "shortcut",
  name: "Translator Trigger",
  workflow: `#/workflows/${workflow.definition.callback_id}`,
  inputs: {
    // クリックしたチャンネルの ID が設定される
    channel_id: { value: "{{data.channel_id}}" },
    // フォームを開くために必要なのでワークフローに引き渡す
    // ワークフローの中の OpenForm を使うために必要なパラメーター
    interactivity: { value: "{{data.interactivity}}" },
  },
};

// トリガーの作成には `slack triggers create --trigger-def [ファイルパス]` を実行する
// Trigger 形の定義オブジェクトを export default さえしていれば
// そのソースファイルを使用できる
export default trigger;
