import { Connection, WorkflowClient } from '@temporalio/client';
import { OpenTelemetryWorkflowClientCallsInterceptor } from '@temporalio/interceptors-opentelemetry/lib/client';
import { example } from './workflows';
import { setupOpentelemetry } from './worker/setup';

async function run() {
  const otel = await setupOpentelemetry();
  // Connect to localhost with default ConnectionOptions,
  // pass options to the Connection constructor to configure TLS and other settings.
  const connection = new Connection({});
  // Attach the OpenTelemetryWorkflowClientCallsInterceptor to the client.
  const client = new WorkflowClient(connection.service, {
    interceptors: {
      calls: [() => new OpenTelemetryWorkflowClientCallsInterceptor()],
    },
  });
  // Create a typed handle for the example Workflow.
  // Workflow will be started in the "default" namespace unless specified otherwise.
  const workflow = client.createWorkflowHandle(example, {
    taskQueue: 'interceptors-opentelemetry-example',
  });
  const result = await workflow.execute('Temporal');
  console.log(result); // Hello, Temporal!
  await otel.sdk.shutdown();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});