import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get events happening in the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data: upcomingEvents, error: eventsError } = await supabaseClient
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .lte('event_date', threeDaysFromNow.toISOString().split('T')[0]);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    console.log(`Found ${upcomingEvents?.length || 0} upcoming events`);

    // Get all users with their preferences
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, onboarding_answers');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    let notificationsSent = 0;

    // For each event, find matching users and send notifications
    for (const event of upcomingEvents || []) {
      for (const profile of profiles || []) {
        const preferences = profile.onboarding_answers as any;
        
        // Check if user's districts match the event's district
        if (preferences?.districts?.includes(event.district)) {
          // Check if notification already exists
          const { data: existingNotification } = await supabaseClient
            .from('notifications')
            .select('id')
            .eq('user_id', profile.id)
            .eq('event_id', event.id)
            .single();

          if (!existingNotification) {
            const daysUntil = Math.ceil(
              (new Date(event.event_date).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );

            const message = `🎉 ${event.name} starts in ${daysUntil} day${
              daysUntil !== 1 ? 's' : ''
            } in ${event.location}! Don't miss it!`;

            const { error: notificationError } = await supabaseClient
              .from('notifications')
              .insert({
                user_id: profile.id,
                event_id: event.id,
                message: message,
              });

            if (notificationError) {
              console.error('Error creating notification:', notificationError);
            } else {
              notificationsSent++;
            }
          }
        }
      }
    }

    console.log(`Sent ${notificationsSent} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent,
        eventsProcessed: upcomingEvents?.length || 0 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in send-event-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
