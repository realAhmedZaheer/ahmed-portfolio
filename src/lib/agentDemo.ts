export interface Scenario {
  id: string;
  prompt: string;
  tool: string;
  argsPreview: string;
  result: string;
}

export function routeScenario(
  list: Scenario[],
  id: string,
): Scenario | undefined {
  return list.find((s) => s.id === id);
}
