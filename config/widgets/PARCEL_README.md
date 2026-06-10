# Parcel App Widget for Dynacat

This widget displays your active package deliveries from the Parcel App API in your Dynacat dashboard.

## Features

- 📦 Shows all active deliveries with real-time status
- 🚚 Color-coded status indicators (In Transit, Out for Delivery, Delivered, etc.)
- 📍 Latest tracking event with location
- 📅 Expected delivery dates
- 🎨 Clean, modern UI that matches your Dynacat theme
- ⚙️ Configurable display options
- 🔒 Conservative caching (1 hour) to respect API rate limits (20/hour)
- 💾 Even with 1h cache, max 24 requests/day leaves plenty of headroom

## Setup

### 1. Get Your API Key

1. Go to [web.parcelapp.net](https://web.parcelapp.net)
2. Generate an API key (premium feature)
3. Copy your API key

### 2. Set Environment Variable

Add your API key as an environment variable named `PARCEL_API_KEY`. 

**For Docker Compose:**
```yaml
environment:
  - PARCEL_API_KEY=your_api_key_here
```

**For Docker run:**
```bash
-e PARCEL_API_KEY=your_api_key_here
```

### 3. Include Widget in Dashboard

Edit your `dynacat.yml` file and add the widget include where you want it to appear:

```yaml
pages:
  - name: Home
    columns:
      - size: full
        widgets:
          - $include: widgets/parcel.yml
          # ... other widgets
```

### 4. Restart Dynacat

Restart your Dynacat container to apply the changes.

## Configuration Options

You can customize the widget by modifying the `options` section in `parcel.yml`:

```yaml
options:
  show-all: false              # Set to true to show all deliveries without collapsing
  collapse-after: 3            # Number of deliveries to show before collapsing
  max-description-length: 50   # Max characters for description before truncating
```

### Cache Duration Recommendations

The API has a rate limit of **20 requests per hour**. Here are safe cache durations:

| Cache Time | Requests/Day | Headroom | Recommended For |
|------------|--------------|----------|------------------|
| `cache: 3h` | 8 | Excellent | Low activity, very conservative |
| `cache: 2h` | 12 | Very Good | Normal use, recommended |
| `cache: 1h` | 24 | Good | **Default - balanced** |
| `cache: 45m` | 32 | Risky | High activity monitoring |
| `cache: 30m` | 48 | ⚠️ Over limit | Not recommended |

**Note:** The Parcel API returns cached data anyway, so longer cache times don't affect data freshness much.

## Status Codes

The widget displays the following statuses with color coding:

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| Delivered | ✓ | Green | Delivery completed |
| In Transit | 🚚 | Primary | Package is on its way |
| Out for Delivery | 🚛 | Green | Package is out for delivery today |
| Ready for Pickup | 📦 | Highlight | Package ready at pickup location |
| Info Received | 📋 | Subdued | Carrier has shipping info only |
| Failed Delivery | ⚠ | Red | Delivery attempt failed |
| Exception | ⚠ | Red | Problem with delivery |
| Not Found | ❌ | Red | Tracking number not found |
| Frozen | ❄ | Subdued | No updates for extended period |

## Advanced: Show Recent Deliveries

To show recent deliveries instead of only active ones, modify the URL in `parcel.yml`:

```yaml
url: https://api.parcel.app/external/deliveries/?filter_mode=recent
```

## Troubleshooting

### Widget shows "Error" message
- Check that `PARCEL_API_KEY` environment variable is set correctly
- Verify your API key is valid at web.parcelapp.net
- Ensure you have a premium Parcel App subscription

### Widget shows "No active deliveries"
- This is normal if you have no packages in transit
- Try changing `filter_mode=active` to `filter_mode=recent` to see past deliveries

### Widget not updating
- The widget caches for 1 hour by default (safe for 20 req/hour limit)
- To update more frequently, change `cache: 1h` to `cache: 2h` or `cache: 3h` for even more headroom
- The Parcel App API shows cached data from the app anyway
- Rate limit is 20 requests per hour

## API Documentation

For more details about the Parcel App API, visit:
- API Endpoint: https://api.parcel.app/external/deliveries/
- Rate Limit: 20 requests per hour
- Documentation: See API documentation in your Parcel App account

## Example Output

When you have active deliveries, the widget displays:

```
┌─ Parcel Deliveries ─────────────────┐
│                                      │
│              3                       │
│      ACTIVE DELIVERIES               │
│                                      │
│ ┃ New Running Shoes            🚛   │
│ ┃ USPS • 1234567890            Out for│
│ ┃ 📅 Expected: 2024-01-15        Delivery│
│ ┃ Latest: Out for delivery      │
│ ┃ 📍 Local Distribution Center  │
│                                      │
│ ┃ Birthday Gift                🚚   │
│ ┃ UPS • 9876543210             In  │
│ ┃ 📅 Expected: 2024-01-17      Transit│
│                                      │
└──────────────────────────────────────┘
```

## Credits

- Widget created for Dynacat (a fork of Glance)
- Uses the Parcel App External API
- Follows Dynacat custom-api widget patterns
