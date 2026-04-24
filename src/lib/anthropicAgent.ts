import type { Tool } from '@anthropic-ai/sdk/resources/messages/messages';

type EnvLike = Record<string, string | undefined>;

export interface ResolvedAnthropicConfig {
  apiKey?: string;
  model: string;
  usedLegacyTypo: boolean;
}

export interface McpToolDefinition {
  name: string;
  description?: string;
  inputSchema?: {
    type?: string;
    properties?: Record<string, unknown>;
    required?: string[];
    [key: string]: unknown;
  };
}

export function getDefaultAnthropicModel(): string {
  return 'claude-sonnet-4-5-20250929';
}

export function resolveAnthropicConfig(env: EnvLike): ResolvedAnthropicConfig {
  const apiKey = env.ANTHROPIC_API_KEY || env.ANTRHOPIC_API_KEY;

  return {
    apiKey,
    model: env.ANTHROPIC_MODEL || getDefaultAnthropicModel(),
    usedLegacyTypo: !env.ANTHROPIC_API_KEY && Boolean(env.ANTRHOPIC_API_KEY),
  };
}

export function mapMcpToolsToAnthropicTools(
  tools: McpToolDefinition[]
): Tool[] {
  return tools.map((tool) => {
    const { type: _ignored, ...rest } = tool.inputSchema ?? {};
    return {
      name: tool.name,
      description: tool.description || 'MCP tool',
      input_schema: {
        type: 'object' as const,
        ...rest,
      },
    };
  });
}
