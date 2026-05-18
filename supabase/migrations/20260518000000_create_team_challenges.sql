-- Create team_challenges table
CREATE TABLE IF NOT EXISTS public.team_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    challenged_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    message TEXT,
    status request_status DEFAULT 'pendiente' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT no_self_challenge CHECK (challenger_id <> challenged_id)
);

-- Enable RLS
ALTER TABLE public.team_challenges ENABLE ROW LEVEL SECURITY;

-- Select policy:
-- Members of challenger or challenged team can read challenges
CREATE POLICY select_team_challenges ON public.team_challenges
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = team_challenges.challenger_id
            AND team_members.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = team_challenges.challenged_id
            AND team_members.user_id = auth.uid()
        )
    );

-- Insert policy:
-- Any member of the challenger team can insert a challenge
CREATE POLICY insert_team_challenges ON public.team_challenges
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = team_challenges.challenger_id
            AND team_members.user_id = auth.uid()
        )
    );

-- Update policy:
-- Only members of the challenged team can update the status
CREATE POLICY update_team_challenges ON public.team_challenges
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = team_challenges.challenged_id
            AND team_members.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = team_challenges.challenged_id
            AND team_members.user_id = auth.uid()
        )
    );
