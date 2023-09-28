import { Manifest } from "deno-slack-sdk/mod.ts";
import { workflow as HelloWorld } from "./hello_world.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "slack-deno-playground",
  description: "A blank template for building Slack apps with Deno",
  icon: "assets/default_new_app_icon.png",
  functions: [],
  // ここでワークフローを登録する
  workflows: [HelloWorld],
  outgoingDomains: [],
  botScopes: ["commands", "chat:write", "chat:write.public"],
});
