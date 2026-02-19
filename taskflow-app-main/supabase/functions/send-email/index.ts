// Esta es una Edge Function de Supabase que se ejecuta en el servidor
// Necesita ser deploye en Supabase con: supabase functions deploy send-email
// Usa Resend para enviar correos electrónicos

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  type?: string
  taskId?: string
  data?: any
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as EmailRequest
    
    const { to, subject, html } = body

    // Validar inputs
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener credenciales de Resend desde variables de entorno (secreto)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    console.log('[send-email] Variables de entorno disponibles:', Object.keys(Deno.env.toObject()))
    console.log('[send-email] RESEND_API_KEY:', resendApiKey ? 'CONFIGURADA' : 'NO ENCONTRADA')
    
    if (!resendApiKey) {
      console.error('[send-email] ERROR: RESEND_API_KEY not configured')
      console.error('[send-email] Variables disponibles:', Object.keys(Deno.env.toObject()))
      return new Response(
        JSON.stringify({ error: 'Email service not configured - RESEND_API_KEY missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enviar con Resend usando su API REST
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev', // Cambia esto a tu dominio verificado en Resend
        to: to,
        subject: subject,
        html: html,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend error:', data)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Email sent successfully to ${to}`)
    return new Response(
      JSON.stringify({ success: true, message: `Email sent to ${to}`, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
