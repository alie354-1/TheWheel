import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client (assumes env vars are set)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type DecisionEvent = {
  id?: string;
  company_id?: string;
  user_id?: string;
  event_type: string;
  context?: Record<string, any>;
  data?: Record<string, any>;
  created_at?: string;
};

// POST: Log a new decision event
async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { company_id, user_id, event_type, context, data } = req.body;

  if (!event_type || typeof event_type !== 'string') {
    return res.status(400).json({ error: 'event_type is required' });
  }

  const { error, data: inserted } = await supabase
    .from('decision_events')
    .insert([
      {
        company_id,
        user_id,
        event_type,
        context: context || {},
        data: data || {},
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(inserted);
}

// GET: Retrieve decision events (with optional filters)
async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { company_id, user_id, event_type, from, to, limit = 100 } = req.query;

  let query = supabase
    .from('decision_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Number(limit));

  if (company_id) query = query.eq('company_id', company_id);
  if (user_id) query = query.eq('user_id', user_id);
  if (event_type) query = query.eq('event_type', event_type);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'GET') {
    return handleGet(req, res);
  } else {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end('Method Not Allowed');
  }
}
