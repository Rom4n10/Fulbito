-- Migration to create the webhook trigger for the send-notification-email edge function
CREATE OR REPLACE TRIGGER on_notification_created
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
    'http://host.docker.internal:54321/functions/v1/send-notification-email',
    'POST',
    '{"Content-Type":"application/json"}',
    '{}',
    '1000'
  );
