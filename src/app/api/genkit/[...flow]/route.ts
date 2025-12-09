import { defineFlow } from '@genkit-ai/flow';
import { getAllFlows } from '@genkit-ai/flow';
import { createFlowsApi } from '@genkit-ai/next';
import '@/ai/dev'; // Make sure this is imported to register your flows

const flows = getAllFlows();

export const { GET, POST } = createFlowsApi({
  flows,
  // You can add your own authentication and other configuration here.
  // See https://firebase.google.com/docs/genkit/flows#control-access-to-your-flows
});
