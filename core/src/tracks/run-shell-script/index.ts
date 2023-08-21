import type { Lightrail, LightrailTrack } from "lightrail-sdk";
import { ChatRequestMessage } from "llm-api";
import { marked } from "marked";

export default class Track implements LightrailTrack {
  lightrail: Lightrail;

  constructor(lightrail) {
    this.lightrail = lightrail;
  }

  async init() {
    const lightrail = this.lightrail;

    lightrail.registerAction({
      name: "Run Shell Script",
      description: "Run a shell script",
      color: "#006400", // updated color
      icon: "file-lines",
      args: [],
      async mainHandler(userPrompt, _args) {
        const { EventEmitter } = require("events");
        const llmClient = lightrail.getLLMClient()!;
        const ee = new EventEmitter();

        const prompt =
          userPrompt +
          "\n\n" +
          "Output only a code-block containing a bash shell script. Any descriptions should be comments in the shell script. Do not output anything outside of the code block. The shell script must be executable as-is.";

        ee.on("data", (data) => {
          lightrail.sendEvent({
            name: "shellscript:codegen-token",
            data: data,
          });
        });

        const chatMessage: ChatRequestMessage = {
          role: "user",
          content: prompt,
        };

        console.log(prompt);

        const response = await llmClient.chatCompletion([chatMessage], {
          events: ee,
        });

        const tokens = marked.lexer(response.content);
        const script = tokens.find((token) => token.type === "code");

        if (script && script.type === "code") {
          lightrail.sendEvent({
            name: "shellscript:codegen-response",
            data: script,
          });
        }
      },
      async rendererHandler(prompt, args) {
        lightrail.ui?.reset();
      },
    });

    if (lightrail.isRenderer) {
      lightrail.registerEventListener(
        "shellscript:codegen-response",
        async (event) => {
          const response = event.data;
          lightrail.ui?.chat.setPartialMessage(null);
          lightrail.ui?.chat.setHistory((prev) => [
            ...prev,
            {
              sender: "ai",
              content: response.raw,
            },
          ]);
          lightrail.ui?.controls.setControls([
            {
              type: "buttons",
              buttons: [
                {
                  label: "Discard",
                  onClick: () => {
                    lightrail.ui?.reset();
                  },
                },
                {
                  label: "Run",
                  color: "primary",
                  onClick: () => {
                    lightrail.sendEvent({
                      name: "shellscript:run",
                      data: response.text,
                    });
                  },
                },
              ],
            },
          ]);
        }
      );
      lightrail.registerEventListener(
        "shellscript:codegen-token",
        async (event) => {
          const token = event.data;
          lightrail.ui?.chat.setPartialMessage((prev) =>
            prev ? prev + token : token
          );
        }
      );
    }

    if (lightrail.isMain) {
      lightrail.registerEventListener("shellscript:run", async (event) => {
        const script = event.data;
        const path = await lightrail.writeTempFile(script, "script.sh");
        const { exec } = require("child_process");
        console.log("RUNNING");
        exec(`bash ${path}`, (error, stdout, stderr) => {
          if (error) {
            console.log(`exec error: ${error}`);
            return;
          }

          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
        });
      });
    }
  }
}
