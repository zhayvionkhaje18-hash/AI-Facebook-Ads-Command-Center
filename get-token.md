# Paano Kunin ang Access Token para sa Graph API Explorer

## Option 1: From Vercel Logs (Mas Safe)

1. **Temporary mag-add ng console.log sa sync endpoint**
   
   Add sa `src/app/api/meta/sync/route.ts` after line na nag-decrypt ng token:
   ```typescript
   const accessToken = Buffer.from(connection.encrypted_access_token, 'base64').toString()
   console.log('🔑 Access Token (first 20 chars):', accessToken.substring(0, 20) + '...')
   ```

2. **Run sync sa Vercel app**
3. **Check Vercel logs** - makikita mo yung token (pero partial lang for security)

## Option 2: Gumawa ng Temporary Debug Endpoint

Mas safe at complete:

```typescript
// Create: src/app/api/meta/debug/token/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const connectionId = searchParams.get('connection_id')
  
  const { data: connection } = await supabase
    .from('meta_connections')
    .select('encrypted_access_token')
    .eq('id', connectionId)
    .single()

  if (!connection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const accessToken = Buffer.from(connection.encrypted_access_token, 'base64').toString()
  
  return NextResponse.json({ 
    token: accessToken,
    warning: '⚠️ DELETE THIS ENDPOINT AFTER TESTING!'
  })
}
```

Then visit: `https://your-app.vercel.app/api/meta/debug/token?connection_id=xxx`

**⚠️ IMPORTANT: DELETE this endpoint pagkatapos gamitin!**

## Option 3: From Supabase Dashboard (Kailangan ng SQL)

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:
   ```sql
   SELECT 
     id,
     facebook_user_name,
     encode(encrypted_access_token::bytea, 'escape') as decrypted_token
   FROM meta_connections
   WHERE workspace_id = 'your-workspace-id';
   ```

3. Copy yung `decrypted_token` value

## Option 4: Graph API Explorer mismo may built-in token

Actually, pwede kang gumamit ng **built-in Access Token ng Graph API Explorer**:

1. Go to: https://developers.facebook.com/tools/explorer/
2. Click "Get Token" → "Get User Access Token"
3. Select permissions na kailangan:
   - `ads_read`
   - `ads_management` 
   - `business_management`
4. Click "Generate Access Token"

**Note:** Pero ito temporary lang (1-2 hours), different sa token sa app

---

## 📝 Mga Test Queries para sa Graph API Explorer

### 1. Get Ad Accounts
```
GET /me/adaccounts?fields=id,name,account_status,currency,amount_spent,balance
```

### 2. Get Campaigns (replace ACT_XXXXXX with actual ad account ID)
```
GET /act_XXXXXX/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,effective_status
```

### 3. Get Ad Sets
```
GET /act_XXXXXX/adsets?fields=id,name,status,campaign_id,daily_budget,targeting
```

### 4. Get Ads
```
GET /act_XXXXXX/ads?fields=id,name,status,adset_id,creative{title,body,image_url}
```

### 5. Test Batch Request (same as ginagawa ng app)
```
POST /?batch=[
  {"method":"GET","relative_url":"act_XXX/campaigns?fields=id,name,status&limit=5"},
  {"method":"GET","relative_url":"act_XXX/adsets?fields=id,name,status&limit=5"}
]
```

---

## 🎯 Ano ang Gusto Nating I-test?

Sabihin mo lang kung alin:

1. **Verify kung may data yung Meta account** - Check if may campaigns, ads, etc.
2. **Test kung tama yung API calls** - Yung exact queries na ginagamit ng app
3. **Debug bakit walang data** - Check permissions or data availability
4. **Compare API response vs database** - Check if sync is saving correctly

Anong gusto mo i-check specifically sa Graph API Explorer?
