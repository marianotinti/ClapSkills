import { describe, expect, it } from "vitest";

import { parseMcpResponseText } from "./mcp";

describe("parseMcpResponseText", () => {
  it("parses plain JSON responses", () => {
    expect(parseMcpResponseText('{"jsonrpc":"2.0","result":{"ok":true}}')).toEqual({
      jsonrpc: "2.0",
      result: { ok: true },
    });
  });

  it("parses SSE responses without truncating embedded 'data:' strings", () => {
    const payload = {
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: "This payload mentions body data: {\"foo\":\"bar\"} and must still parse.",
          },
        ],
      },
      id: 1,
    };

    const raw = `event: message\ndata: ${JSON.stringify(payload)}\n\n`;

    expect(parseMcpResponseText(raw)).toEqual(payload);
  });
});
