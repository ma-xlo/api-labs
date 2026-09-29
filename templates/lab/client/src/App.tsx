import { Bench, Button, Panel, RequestLog, useApi } from "@labs/ui-kit";

export function App() {
  const api = useApi("/api");

  return (
    <Bench subtitle="__LAB_TITLE__" title="__LAB_NAME__">
      <Panel title="Bancada">
        <Button onClick={() => void api.get("/health")} tone="primary">
          GET /health
        </Button>
      </Panel>

      <Panel title="Requisições">
        <RequestLog entries={api.log} />
      </Panel>
    </Bench>
  );
}
