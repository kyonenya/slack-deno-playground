import { Manifest } from "deno-slack-sdk/mod.ts";
// import { workflow as HelloWorld } from "./hello_world.ts";
import { def as MySendMessage } from "./my_send_message.ts";
import { workflow as HelloWorld2 } from "./hello_world_2.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "slack-deno-playground",
  description: "A blank template for building Slack apps with Deno",
  icon: "assets/default_new_app_icon.png",
  functions: [MySendMessage],
  // ここでワークフローを登録する
  workflows: [HelloWorld2],
  outgoingDomains: [],
  botScopes: ["commands", "chat:write", "chat:write.public"],
});
