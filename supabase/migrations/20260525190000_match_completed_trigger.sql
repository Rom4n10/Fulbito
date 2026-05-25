-- Trigger para actualizar matches_played de los usuarios al completarse un partido
CREATE OR REPLACE FUNCTION public.handle_match_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completado' AND (OLD.status IS NULL OR OLD.status != 'completado') THEN
    -- Incrementar matches_played del creador
    UPDATE public.users
    SET matches_played = COALESCE(matches_played, 0) + 1
    WHERE id = NEW.creator_id;

    -- Incrementar matches_played de los participantes aceptados
    UPDATE public.users
    SET matches_played = COALESCE(matches_played, 0) + 1
    WHERE id IN (
      SELECT user_id 
      FROM public.match_requests 
      WHERE match_id = NEW.id AND status = 'aceptado'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_match_completed
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_match_completed();
