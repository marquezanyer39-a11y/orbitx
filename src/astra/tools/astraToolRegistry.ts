import type { AstraToolDefinition, AstraToolId } from './astraTool.types';
import { createAstraMockTools } from './mock/astraMockTools';

export class AstraToolRegistry {
  private readonly tools = new Map<AstraToolId, AstraToolDefinition>();

  constructor(initialTools: AstraToolDefinition[] = createAstraMockTools()) {
    initialTools.forEach((tool) => this.register(tool));
  }

  register(tool: AstraToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  get(toolId: AstraToolId): AstraToolDefinition | null {
    return this.tools.get(toolId) ?? null;
  }

  list(): AstraToolDefinition[] {
    return Array.from(this.tools.values());
  }

  clear(): void {
    this.tools.clear();
  }
}

export const astraToolRegistry = new AstraToolRegistry();
