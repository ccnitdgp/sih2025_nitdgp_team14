import {createApi} from '@genkit-ai/next';
import '@/ai/dev'; // Make sure this is imported to register your flows

export const {GET, POST} = createApi();
