# Parcel API Rate Limit Calculator

## API Limits
- **Rate Limit:** 20 requests per hour
- **Hard Limit:** 20 requests in any 60-minute rolling window

## Cache Duration Math

The widget makes ONE request per cache period. Here's how many requests you'd make per day:

```
Requests per Day = 24 hours / Cache Hours
```

### Safe Cache Durations ✅

| Cache Setting | Calculation | Requests/Day | Requests/Hour (avg) | Status |
|---------------|-------------|--------------|---------------------|---------|
| `cache: 4h` | 24 ÷ 4 | **6** | 0.25 | ✅ Very Conservative |
| `cache: 3h` | 24 ÷ 3 | **8** | 0.33 | ✅ Excellent Headroom |
| `cache: 2h` | 24 ÷ 2 | **12** | 0.5 | ✅ **Recommended** |
| `cache: 1h` | 24 ÷ 1 | **24** | 1.0 | ✅ **Default** (Safe) |

### Risky Cache Durations ⚠️

| Cache Setting | Calculation | Requests/Day | Requests/Hour (avg) | Status |
|---------------|-------------|--------------|---------------------|---------|
| `cache: 45m` | 24 ÷ 0.75 | **32** | 1.33 | ⚠️ Risky (66% over limit) |
| `cache: 30m` | 24 ÷ 0.5 | **48** | 2.0 | ❌ Will Hit Limit |
| `cache: 15m` | 24 ÷ 0.25 | **96** | 4.0 | ❌ Way Over Limit |

## Why 1h is Safe (Default)

Even though 24 requests/day averages to 1 request/hour, you're still safe because:

1. **Spread Over Time:** Requests happen every hour on the hour, not all at once
2. **Rolling Window:** The API limit is "20 in any 60-minute window"
3. **Max Burst:** Even if you manually refresh the page, you'd only hit the cache at most once per hour
4. **API Caches Too:** The Parcel API itself returns cached data, so you're not missing real-time updates anyway

### Example Timeline (1h cache)

```
Hour 00: Request #1  ← Cache stored
Hour 01: Request #2  ← Cache stored (Hour 00 cache expires)
Hour 02: Request #3  ← Cache stored
...
Hour 23: Request #24 ← Cache stored

Total: 24 requests spread across 24 hours
Max in any 60-min window: 2 requests (if you load at 00:59 and 01:01)
```

## Why 2h is Better (Recommended)

With 2-hour caching, you get excellent headroom:

```
Hour 00: Request #1  ← Cache valid until hour 02
Hour 02: Request #2  ← Cache valid until hour 04  
Hour 04: Request #3  ← Cache valid until hour 06
...
Hour 22: Request #12 ← Cache valid until hour 24

Total: 12 requests in 24 hours
Max in any 60-min window: 1 request
Headroom: 40% of limit used (8 requests unused per hour on average)
```

## Important Notes

### The API Returns Cached Data Anyway
The Parcel API documentation states:
> "Calling this endpoint does not trigger an update to your deliveries, you always get a cached response from the app server"

This means:
- 🔄 The API itself doesn't fetch live tracking data
- 📱 It returns whatever your phone app last synced
- ⏱️ Your phone updates deliveries, not the API
- 💡 **Longer cache times don't mean stale data!**

### When Does Data Actually Update?
1. Your phone's Parcel app syncs with carriers (every few hours)
2. The app uploads to Parcel servers
3. The API serves that cached data to you

So even with `cache: 3h`, you're getting data that's as fresh as your phone's last sync!

## Recommendation Summary

### For Most Users: `cache: 2h`
- Only 12 requests/day (40% of limit)
- Data still refreshes reasonably fast
- Plenty of headroom for safety
- Best balance

### For Paranoid/Conservative: `cache: 3h` or `cache: 4h`
- 8 or 6 requests/day
- Huge safety margin
- Still get updates 8/6 times per day
- No practical difference in data freshness

### Default (Safe): `cache: 1h`
- 24 requests/day
- Safe but less headroom
- More frequent updates (though API data is cached anyway)
- Good for peace of mind on delivery days

## How to Change

Edit `config/widgets/parcel.yml`:

```yaml
- type: custom-api
  title: Parcel Deliveries
  cache: 2h  # ← Change this value
  method: GET
  # ... rest of config
```

Then restart Dynacat.
