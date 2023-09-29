import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

// ファンクションのメタデータを定義
export const def = DefineFunction({
  callback_id: "translator",
  title: "Translator",
  description: "A funtion to translate text",
  source_file: "translator/function.ts", // このファイルパスはファイルを移動したり名前を変えたら同期する必要があります
  input_parameters: {
    properties: {
      // 翻訳対象のテキスト
      text: { type: Schema.types.string },
      // DeepL API に渡す翻訳前の言語コード（オプショナル）
      source_lang: { type: Schema.types.string },
      // DeepL API に渡す翻訳後の言語コード
      target_lang: { type: Schema.types.string },
    },
    required: ["text", "target_lang"],
  },
  output_parameters: {
    properties: {
      translated_text: { type: Schema.types.string },
    },
    required: ["translated_text"],
  },
});

// ハンドラーの処理を設定して export default することでワークフローに組み込めるようになる
// このファンクションはワークフローから、少なくとも `text`, `target_lang` の二つの inputs を受け取らないと起動できません
export default SlackFunction(def, async ({
  inputs,
  env,
}) => {
  // slack env add DEEPL_AUTH_KEY [値] であらかじめ設定しておく必要がある
  const authKey = env.DEEPL_AUTH_KEY;
  if (!authKey) {
    // 異常終了として error のみを返してワークフローの実行を終了する
    return { error: "DEEPL_AUTH_KEY env value is missing!" };
  }
  const apiSubdomain = authKey.endsWith(":fx") ? "api-free" : "api";
  const apiUrl = `https://${apiSubdomain}.deepl.com/v2/translate`;
  // パラメーターとヘッダーを準備
  const body = new URLSearchParams();
  body.append("auth_key", authKey);
  body.append("text", inputs.text);
  if (inputs.source_lang) {
    body.append("source_lang", inputs.source_lang.toUpperCase());
  }
  body.append("target_lang", inputs.target_lang.toUpperCase());
  const requestHeaders = {
    "content-type": "application/x-www-form-urlencoded;charset=utf-8",
  };
  // DeepL API を fetch 関数で呼び出し
  const apiResponse = await fetch(apiUrl, {
    method: "POST",
    headers: requestHeaders,
    body,
  });
  const apiResponseStatus = apiResponse.status;
  if (apiResponseStatus != 200) {
    const body = await apiResponse.text();
    console.log(`apiResponse: ${apiResponse}, body: ${body}`);
    const error =
      `DeepL API call failed - status: ${apiResponseStatus}, body: ${body}`;
    // 異常終了として error のみを返してワークフローの実行を終了する
    return { error };
  }
  // レスポンスボディをパースして翻訳結果を取得
  const translationResult = await apiResponse.json();
  if (!translationResult || translationResult.translations.length === 0) {
    const error = `Translation failed for some reason: ${
      JSON.stringify(translationResult)
    }`;
    console.log(error);
    // 異常終了として error のみを返してワークフローの実行を終了する
    return { error };
  }
  // output_parameters に適合する outputs を返す
  return {
    outputs: {
      translated_text: translationResult.translations[0].text,
    },
  };
});
