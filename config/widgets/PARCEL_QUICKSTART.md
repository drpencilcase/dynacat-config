# Quick Start Guide - Adding Parcel Widget to Dynacat

## Step 1: Set Environment Variable

Add this to your Dynacat Docker container configuration:

```yaml
environment:
  - PARCEL_API_KEY=your_actual_api_key_here
```

Get your API key from: https://web.parcelapp.net

## Step 2: Add Widget to dynacat.yml

Open `appdata/dynacat/config/dynacat.yml` and add this line where you want the widget to appear.

For example, to add it after your existing widgets:

```yaml
pages:
    - name: Home
      columns:
          - size: full
            widgets:
                - type: search
                  search-engine: https://kagi.com/search?q={QUERY}
                  autofocus: false
                  autocomplete: true

                - $include: widgets/weather.yml
                - $include: widgets/pihole.yml
                - $include: widgets/karakeep.yml
                - $include: widgets/parcel.yml    # <-- ADD THIS LINE
```

## Step 3: Restart Dynacat

Restart your Dynacat container:

```bash
docker restart dynacat
```

Or if using docker-compose:

```bash
docker-compose restart dynacat
```

## Customization

### Adjust cache time for API rate limits

The default is `cache: 1h` which uses max 24 requests/day (well under the 20/hour limit).

For even more headroom, edit `widgets/parcel.yml`:

```yaml
cache: 2h  # Only 12 requests per day - recommended for peace of mind
```

| Cache | Daily Requests | Safe? |
|-------|----------------|-------|
| 3h | 8 | ✅ Very safe |
| 2h | 12 | ✅ Safe (recommended) |
| 1h | 24 | ✅ Safe (default) |
| 30m | 48 | ❌ Over limit! |

### Change how many deliveries show before collapsing

Edit `widgets/parcel.yml` and change:

```yaml
options:
  collapse-after: 3  # Change to 5, 10, or any number
```

### Show all deliveries without collapsing

```yaml
options:
  show-all: true
```

### Show recent deliveries instead of only active

Change the URL in `widgets/parcel.yml`:

```yaml
url: https://api.parcel.app/external/deliveries/?filter_mode=recent
```

### Adjust description length

```yaml
options:
  max-description-length: 50  # Change to 30, 60, 100, etc.
```

## Troubleshooting

### "Error" message in widget
1. Make sure `PARCEL_API_KEY` environment variable is set
2. Verify your API key is valid
3. Check that you have a premium Parcel App subscription

### Widget shows "No active deliveries"
This is normal if you have no packages currently in transit.

### Widget not appearing
1. Make sure you added `- $include: widgets/parcel.yml` to dynacat.yml
2. Check that the widget file is in the correct location: `config/widgets/parcel.yml`
3. Restart the Dynacat container
4. Check Dynacat logs for errors

## Files Created

- `config/widgets/parcel.yml` - Main widget configuration
- `config/widgets/PARCEL_README.md` - Full documentation
- `config/widgets/parcel-examples.yml` - Alternative configurations
- `config/widgets/PARCEL_QUICKSTART.md` - This file

## What the Widget Shows

For each active delivery:
- 📦 Package description
- 🚚 Carrier and tracking number  
- 🎨 Color-coded status (In Transit, Out for Delivery, etc.)
- 📅 Expected delivery date
- 📍 Latest tracking event with location
- ✓ Status icon

Enjoy tracking your packages! 📦
