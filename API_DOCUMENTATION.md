# AdPilot AI API Documentation

## Base URL
```
https://<your-domain>/api
```

## Authentication
All API endpoints require authentication via Supabase session cookies. The middleware handles session validation automatically.

## Rate Limiting
- 100 requests per minute per IP
- Rate limit headers included in all responses:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## Common Response Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - invalid parameters |
| 401 | Unauthorized - not logged in |
| 403 | Forbidden - no workspace access |
| 429 | Too Many Requests - rate limited |
| 500 | Internal Server Error |

---

## Health Check

### GET /api/health
Returns application health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-06-21T12:00:00Z",
  "uptime": 3600,
  "latency": 45,
  "checks": {
    "database": { "status": "ok", "latency": 12 },
    "memory": { "status": "ok", "message": "Heap: 128MB" }
  },
  "version": "0.1.0"
}
```

---

## Campaigns

### GET /api/meta/campaigns
List campaigns for a workspace.

**Query Parameters:**
- `workspace_id` (required): UUID of workspace
- `connection_id` (optional): Filter by Meta connection

**Response:**
```json
{
  "campaigns": [
    {
      "id": "uuid",
      "campaign_id": "123456789",
      "name": "Summer Sale 2026",
      "status": "ACTIVE",
      "objective": "CONVERSIONS"
    }
  ]
}
```

---

## Insights

### GET /api/meta/insights
Fetch performance insights.

**Query Parameters:**
- `workspace_id` (required): UUID
- `entity_type` (optional): account, campaign, adset, ad
- `start_date`, `end_date` (optional): YYYY-MM-DD

**Response:**
```json
{
  "insights": [
    {
      "date": "2026-06-20",
      "spend": 150.00,
      "impressions": 50000,
      "clicks": 500,
      "conversions": 25,
      "purchase_value": 750.00
    }
  ]
}
```

---

## Recommendations

### GET /api/recommendations
Generate scaling recommendations.

**Query Parameters:**
- `workspace_id` (required): UUID
- `start_date`, `end_date` (optional): Date range for analysis

**Response:**
```json
{
  "recommendations": [
    {
      "id": "rec_...",
      "campaignId": "123456789",
      "campaignName": "Summer Sale",
      "actionType": "increase_budget",
      "confidenceScore": 0.85,
      "reasoning": "Strong ROAS of 3.2x...",
      "currentMetrics": { "roas": 3.2, "ctr": 1.5 },
      "suggestedValue": { "budget_increase_percent": 20 }
    }
  ],
  "hasData": true
}
```

### PATCH /api/recommendations/:id
Update recommendation status.

**Body:**
```json
{ "status": "applied" }
```
Valid statuses: `applied`, `dismissed`, `expired`

---

## Forecasts

### GET /api/forecasts
Generate performance forecasts.

**Query Parameters:**
- `workspace_id` (required): UUID
- `campaign_id` (optional): Specific campaign
- `period_days` (optional): Forecast period (default: 14)
- `confidence_level` (optional): 0.95 default

**Response:**
```json
{
  "forecasts": [
    {
      "campaignId": "123456789",
      "forecastType": "revenue",
      "predictedTotal": 5000.00,
      "confidenceLower": 4500.00,
      "confidenceUpper": 5500.00,
      "dailyForecasts": [...]
    }
  ]
}
```

---

## Alerts

### GET /api/alerts
List alerts.

**Query Parameters:**
- `workspace_id` (required): UUID
- `status` (optional): active, resolved, dismissed, all

### POST /api/alerts
Trigger alert scan.

**Query Parameters:**
- `workspace_id` (required): UUID

### PATCH /api/alerts/:id
Update alert status.

**Body:**
```json
{ "status": "resolved" }
```

---

## Reports

### POST /api/reports
Generate and download report.

**Body:**
```json
{
  "workspace_id": "uuid",
  "report_type": "campaign_summary",
  "format": "csv",
  "title": "My Report",
  "filters": {
    "start_date": "2026-06-01",
    "end_date": "2026-06-21"
  }
}
```

**Response:** CSV/Excel file download

### POST /api/reports/share
Create shareable link.

**Body:**
```json
{
  "report_id": "uuid",
  "expires_in_days": 7,
  "password": "optional"
}
```

---

## AI Chat

### POST /api/chat
Ask campaign questions.

**Body:**
```json
{
  "query": "What are my top performing campaigns?",
  "workspace_id": "uuid"
}
```

**Response:**
```json
{
  "response": "Your top campaigns are...",
  "sources": [
    { "type": "campaign", "entityId": "...", "entityName": "Summer Sale" }
  ]
}
```

---

## Notifications

### GET /api/notifications
List user notifications.

**Query Parameters:**
- `status`: all, unread
- `limit`: max results (default: 50)

### PATCH /api/notifications
Batch update notifications.

**Body:**
```json
{
  "action": "mark_read",
  "ids": ["uuid1", "uuid2"]
}
```
Actions: `mark_read`, `mark_all_read`, `delete`

### GET /api/notifications/preferences
Get notification preferences.

### PUT /api/notifications/preferences
Update preferences.

**Body:**
```json
{
  "email_enabled": true,
  "alert_email": true,
  "digest_frequency": "daily",
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00"
}
```

---

## Meta OAuth

### GET /api/meta/connect
Initiate Meta OAuth flow.

**Query Parameters:**
- `workspace_id` (required): UUID

### GET /api/meta/callback
OAuth callback handler.

### GET /api/meta/status
Get connection status and stats.

**Query Parameters:**
- `workspace_id` (required): UUID

---

## Workspaces

### GET /api/workspaces
List user's workspaces.

### POST /api/workspaces
Create workspace.

**Body:**
```json
{ "name": "My Workspace" }
```

### GET /api/workspaces/:id/members
List workspace members.

### POST /api/workspaces/:id/members
Invite member.

**Body:**
```json
{ "email": "user@example.com", "role": "member" }
```

Roles: `owner`, `admin`, `member`, `viewer`

---

## Error Handling

All errors follow this format:
```json
{
  "error": "Human-readable error message",
  "details": { /* optional additional context */ }
}
```

## Security

- All endpoints require valid Supabase session
- Workspace access verified via `workspace_members` table
- Rate limiting: 100 req/min per IP
- CSP headers prevent XSS
- HSTS enforced for HTTPS
- Audit logging for write operations
