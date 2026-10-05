import { supabase } from '../utils/supabaseClient.js';
import { createDemoPaymentService } from './createDemoPaymentService.js';

export const demoPaymentService = createDemoPaymentService(supabase);
