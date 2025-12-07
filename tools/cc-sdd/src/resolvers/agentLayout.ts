import { getAgentDefinition, type AgentType } from '../agents/registry.js';

export type { AgentType } from '../agents/registry.js';

export interface AgentLayout {
  commandsDir: string;
  agentDir: string;
  docFile: string;
}

import path from 'node:path';
import { homedir } from 'node:os';

export interface CCSddConfig {
  agentLayouts?: Partial<Record<AgentType, Partial<AgentLayout>>>;
  global?: boolean;
}

export const resolveAgentLayout = (agent: AgentType, config?: CCSddConfig): AgentLayout => {
  const definition = getAgentDefinition(agent);
  const base = definition.layout;
  const override = config?.agentLayouts?.[agent] ?? {};

  const layout = { ...base, ...override } as AgentLayout;

  if (config?.global) {
    const globalDir = definition.layout.globalCommandsDir;
    if (!globalDir) {
      throw new Error(`Agent '${definition.label}' does not support global installation.`);
    }

    if (globalDir.startsWith('~/')) {
      layout.commandsDir = path.join(homedir(), globalDir.slice(2));
    } else {
      layout.commandsDir = globalDir;
    }
  }

  return layout;
};
