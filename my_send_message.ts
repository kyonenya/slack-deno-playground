import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

// DefineFunction でファンクションのメタデータを定義
export const def = DefineFunction({
  callback_id: "my-send-message",
  title: "My SendMessage",
  // プロジェクトのルートディレクトリからのパスを指定する必要がある
  // functions/ 配下に配置するときは functions/foo.ts のようになる
  source_file: "my_send_message.ts",
  // inputs の名前と型を一覧で定義、必須のものは required の配列に列挙
  // ファンクションのコードの中で inputs.channel_id のように型安全にアクセスできるようになる
  input_parameters: {
    properties: {
      channel_id: { type: Schema.slack.types.channel_id },
      message: { type: Schema.types.string },
    },
    required: ["channel_id", "message"],
  },
  // このファンクションが返すべき outputs を定義
  // required のものがファンクションコードから返されていない場合
  // コンパイルがエラーとなる
  output_parameters: {
    properties: { ts: { type: Schema.types.string } },
    required: ["ts"],
  },
});

// SlackAPI というユーティリティを使って Slack API クライアントを作成する
// 詳しくは https://api.slack.com/future/apicalls を参照
import { SlackAPI } from "deno-slack-api/mod.ts";

// SlackFunction の定義を export default することで
// このファンクションのハンドラーを有効化し、それをワークフロー側で import できるようにする
export default SlackFunction(def, async ({
  // これらがサポートされているすべての引数
  inputs, // input_parameters に定義されている値
  env, // slack env コマンドで事前に登録された値（SLACK_API_URL は組み込みの値）
  team_id, // ワークスペースの ID（必ず存在する）
  enterprise_id, // Enterprise Grid の場合の OrG の ID（Grid でない場合は空文字となる）
  token, // Slack API 呼び出しに使える bot token
}) => {
  // 標準出力に token 以外を書き出してみている例
  const loggingOutput = {
    inputs,
    env,
    team_id,
    enterprise_id,
  };
  console.log(JSON.stringify(loggingOutput, null, 2));

  // Slack API を初期化
  const client = SlackAPI(token);
  // 自前で chat.postMessage API を呼び出して、指定されたチャンネルにメッセージ投稿
  const newMessageResponse = await client.chat.postMessage({
    channel: inputs.channel_id,
    text: inputs.message,
  });
  console.log(
    `chat.postMessage response: ${JSON.stringify(newMessageResponse, null, 2)}`,
  );
  // 投稿したメッセージの ts を outputs に設定して処理を終了
  const ts = newMessageResponse.ts;
  return { outputs: { ts } };
});
