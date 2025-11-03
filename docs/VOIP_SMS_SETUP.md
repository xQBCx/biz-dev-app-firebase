# VoIP + SMS Communication Platform Setup

## Overview

The BizDev Communications Hub now includes self-hosted VoIP calling and SMS capabilities. This document explains the architecture and how to deploy the required infrastructure.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BizDev Web App                          │
│  (React + Supabase Edge Functions)                          │
│  - Call UI, SMS UI, History, Recordings                     │
└────────────┬────────────────────────────────────────────────┘
             │
             │ API Calls
             │
┌────────────▼────────────────────────────────────────────────┐
│              Supabase Edge Functions                         │
│  - call-create, call-end                                     │
│  - sms-send, sms-webhook-mo, sms-webhook-dlr                │
│  - recording-upload                                          │
└────────┬─────────────────────────────┬──────────────────────┘
         │                             │
         │                             │
┌────────▼──────────┐         ┌────────▼──────────────────────┐
│  Supabase DB      │         │  Self-Hosted Services         │
│  - calls          │         │  (YOU MUST DEPLOY THESE)      │
│  - recordings     │         │                               │
│  - sms_*          │         │  • mediasoup SFU (WebRTC)     │
│  - consent_events │         │  • FreeSWITCH (PBX)          │
└───────────────────┘         │  • coturn (TURN/STUN)        │
                              │  • Jasmin/HTTP (SMS Gateway)  │
                              └───────────────────────────────┘
```

## What Lovable Provides (Already Built)

✅ **Database Schema**: Complete tables for calls, SMS, recordings, consent tracking
✅ **Edge Functions**: API layer for call management, SMS, recording upload
✅ **React UI**: Dialer, SMS composer, call history, playback
✅ **Supabase Storage**: Buckets for call recordings and SMS media

## What You Must Deploy Separately

### 1. mediasoup SFU (WebRTC Media Server)

**Purpose**: Routes audio streams between WebRTC participants

**Setup**:
```bash
# Clone mediasoup demo
git clone https://github.com/versatica/mediasoup-demo.git
cd mediasoup-demo/server

# Configure
npm install
# Edit config.js with your domain/ports

# Run
npm start
```

**Environment Variables**:
```env
SFU_ENDPOINT=wss://sfu.yourdomain.com
```

**What it does**:
- Receives RTP audio from callers
- Forwards to recipients
- Enables recording workers to tap streams

---

### 2. FreeSWITCH PBX (PSTN Bridge)

**Purpose**: Bridges VoIP to PSTN phone numbers via SIP trunk

**Docker Setup**:
```yaml
# docker-compose.yml
services:
  freeswitch:
    image: signalwire/freeswitch:latest
    ports:
      - "5060:5060/udp"  # SIP
      - "5080:5080/tcp"  # WSS
    volumes:
      - ./freeswitch/conf:/etc/freeswitch
    environment:
      - SIP_TRUNK_URI=${SIP_TRUNK_URI}
```

**Key Configs**:
```xml
<!-- /etc/freeswitch/dialplan/default/call_recording.xml -->
<action application="record_session" data="/var/recordings/${uuid}.wav dual" />
<action application="export" data="execute_on_answer=playback:ivr/record_notice.wav" />
```

**Environment Variables**:
```env
SIP_TRUNK_URI=sip:provider@carrier.com
PBX_AUTH_TOKEN=your-secure-token
```

**Webhook**:
- Configure FreeSWITCH to POST recording completion to:
  `https://your-project.supabase.co/functions/v1/recording-upload`

---

### 3. coturn (TURN/STUN Server)

**Purpose**: NAT traversal for WebRTC clients behind firewalls

**Docker Setup**:
```yaml
coturn:
  image: coturn/coturn:latest
  ports:
    - "3478:3478/udp"
    - "3478:3478/tcp"
  environment:
    - TURN_STATIC_SECRET=${TURN_SHARED_SECRET}
    - TURN_REALM=turn.yourdomain.com
```

**Environment Variables**:
```env
TURN_SHARED_SECRET=generate-random-string
TURN_SERVER_URL=turn:turn.yourdomain.com:3478
```

**How it works**:
- Edge function `call-create` generates short-lived credentials
- Uses HMAC-SHA1 with shared secret
- 10-minute credential expiry

---

### 4. SMS Gateway (SMPP or HTTP)

**Purpose**: Send/receive SMS via wholesale carrier

#### Option A: SMPP via Jasmin

```yaml
jasmin:
  image: jookies/jasmin:latest
  ports:
    - "2775:2775"  # SMPP
    - "1401:1401"  # HTTP API
  volumes:
    - ./jasmin/config:/etc/jasmin
```

**Environment Variables**:
```env
SMS_MODE=SMPP
SMPP_HOST=carrier.smpp.example.com
SMPP_PORT=2775
SMPP_SYSTEM_ID=your-system-id
SMPP_PASSWORD=your-password
SMPP_BIND=transceiver
```

#### Option B: Direct HTTP Carrier API

**Environment Variables**:
```env
SMS_MODE=HTTP
CARRIER_HTTP_BASEURL=https://api.smscarrier.com
CARRIER_HTTP_KEY=your-api-key
```

**Webhook Configuration**:
- Point carrier's MO (inbound) webhook to:
  `https://your-project.supabase.co/functions/v1/sms-webhook-mo`
- Point DLR (delivery receipt) webhook to:
  `https://your-project.supabase.co/functions/v1/sms-webhook-dlr`
- Set webhook auth token in env:
  ```env
  INBOUND_WEBHOOK_TOKEN=your-secure-webhook-token
  ```

---

## Complete Environment Variables

```env
# WebRTC / SFU
SFU_ENDPOINT=wss://sfu.yourdomain.com

# TURN/STUN
TURN_SHARED_SECRET=generate-random-64-char-string
TURN_SERVER_URL=turn:turn.yourdomain.com:3478

# PBX / PSTN
SIP_TRUNK_URI=sip:provider@carrier.com
PBX_AUTH_TOKEN=secure-pbx-token

# SMS
SMS_MODE=HTTP  # or SMPP
CARRIER_HTTP_BASEURL=https://api.carrier.com
CARRIER_HTTP_KEY=your-key
INBOUND_WEBHOOK_TOKEN=webhook-secret

# Optional: SMPP
SMPP_HOST=carrier.smpp.example.com
SMPP_PORT=2775
SMPP_SYSTEM_ID=your-id
SMPP_PASSWORD=your-pass

# 10DLC Compliance (US only)
TEN_DLC_BRAND_ID=B1234567
TEN_DLC_CAMPAIGN_ID=C1234567

# MMS
MMS_MEDIA_MAX_MB=5
```

## Database Tables Created

- **calls**: Call records (WebRTC, PSTN, hybrid)
- **call_participants**: Who was in each call
- **call_recordings**: Metadata for audio files
- **consent_events**: Legal compliance (IVR beeps, announcements)
- **sms_conversations**: SMS threads grouped by number pair
- **sms_messages**: Individual SMS with delivery status
- **sms_optouts**: STOP compliance tracking
- **call_transcripts**: Optional AI transcription

## Storage Buckets

- **call-recordings/**: FLAC (archive) + MP3 (preview) recordings
- **sms-media/**: MMS attachments

## Legal Compliance

### Call Recording Consent

The system tracks:
- **ivr_announcement**: Played "This call is recorded"
- **periodic_beep**: 15s beep injections
- **verbal_yes/no**: Manual logging
- **dtmf_1**: Press 1 to consent

### SMS Opt-Out (STOP/START)

Auto-replies to:
- **STOP, UNSUBSCRIBE, CANCEL, END, QUIT** → Adds to `sms_optouts`
- **START, UNSTOP** → Removes from opt-outs
- **HELP** → Sends support info

Blocked sends return status `blocked` in API response.

## Migration Path

### Phase 1 (Current)
- Supabase DB + Storage
- Carrier SIP trunk + SMPP
- Dockerized services (SFU, PBX, TURN, Jasmin)

### Phase 2 (Future)
- Migrate to MinIO for recordings (same S3 layout)
- Add Kamailio for multi-carrier routing
- Replace Supabase Postgres if needed

### Phase 3 (Long-term)
- Direct telco interconnects (bypass carrier)
- Obtain CLEC status
- SS7/Diameter peering

## Testing

### Test WebRTC Call

1. Navigate to **Communications Hub → VoIP**
2. Enter a test number
3. Click "Call"
4. Check browser console for ICE candidates
5. Verify `calls` table has new record

### Test SMS

1. Navigate to **Communications Hub → SMS**
2. Fill in From/To numbers
3. Send test message
4. Check `sms_messages` table for status
5. Reply with "STOP" to test opt-out

### Test Recording Upload

Simulate PBX webhook:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/recording-upload \
  -H "Authorization: Bearer YOUR_PBX_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "uuid-here",
    "codec": "mp3",
    "duration_sec": 45,
    "channels": 2,
    "sample_rate": 48000,
    "file_data": "base64-encoded-audio",
    "checksum": "sha256-hash"
  }'
```

## Cost Estimates

| Service | Provider | Monthly Cost |
|---------|----------|--------------|
| VPS (SFU + PBX) | DigitalOcean | $24/mo |
| TURN Servers (2x) | Vultr | $12/mo |
| SIP Trunk | Twilio/Telnyx | $1 + usage |
| SMPP Gateway | SMSGH/Clickatell | $0 + usage |
| Supabase | Lovable Cloud | Included |
| **Total Base** | | **~$40/mo** |

Usage costs:
- Outbound calls: $0.01-0.02/min
- Inbound calls: $0.005-0.01/min
- SMS: $0.005-0.01/msg

## Support

For issues:
1. Check Edge Function logs in Supabase
2. Verify environment variables are set
3. Test carrier connectivity separately
4. Review RLS policies for permission errors

## Next Steps

1. **Deploy SFU**: Set up mediasoup server
2. **Configure PBX**: Connect FreeSWITCH to SIP trunk
3. **Set TURN**: Deploy coturn with credentials
4. **Choose SMS path**: SMPP or HTTP carrier
5. **Test end-to-end**: Make test call and send SMS
6. **Production**: Add monitoring, scale horizontally
