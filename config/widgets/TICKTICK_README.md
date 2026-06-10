# TickTick Widgets for Dynacat

Two widgets to display your TickTick tasks and habits via your local API proxy.

## Widgets

### 1. Tasks (`ticktick-tasks.yml`)
- Per-project cards with task count summary
- Due-date chips (overdue / today / soon / future)
- Tone colours mapped per project via `tone-{projectId}` options
- Collapsible list, inline task completion (POST to proxy)

### 2. Habits (`ticktick-habits.yml`)
- Active habit list with check-in counters
- Colour-coded borders using TickTick's own colours
- Emoji icons matched to habit type
- Hides archived habits by default

## Setup

### 1. Set `API_PROXY_URL` in `.env`

```
API_PROXY_URL=https://your-api-proxy.example.com
```

The proxy must expose:

| Endpoint | Description |
|---|---|
| `GET /ticktick/tasks` | All open tasks as a JSON array |
| `GET /ticktick/projects` | All projects as a JSON array |
| `POST /ticktick/complete/{projectId}/{taskId}` | Mark a task complete |
| `GET /ticktick/habits` | All habits as a JSON array |

### 2. Add to `dynacat.yml`

```yaml
columns:
  - size: small
    widgets:
      - $include: widgets/ticktick-tasks.yml
      # - $include: widgets/ticktick-habits.yml
```

### 3. Map project colours (optional)

In `ticktick-tasks.yml`, find your project IDs by calling
`GET ${API_PROXY_URL}/ticktick/projects` and reading each `id` field. Then add
entries under `options`:

```yaml
options:
    tone-abc123: pine   # House
    tone-def456: iris   # Work
    tone-ghi789: foam   # Personal
```

Available tones: `iris` `foam` `love` `gold` `rose` `pine`

## Options reference

### Tasks widget

| Option | Default | Description |
|---|---|---|
| `max-tasks-per-project` | `10` | Max tasks shown per project card |
| `max-title-length` | `80` | Truncate titles longer than this |
| `tone-{projectId}` | `iris` | Rosé Pine tone for that project's card |

### Habits widget

| Option | Default | Description |
|---|---|---|
| `collapse-after` | `6` | Items shown before "show more" |
| `show-all` | `false` | Disable collapsing entirely |
| `show-archived` | `false` | Include archived (status ≠ 0) habits |

## Habit icon map

| TickTick icon name | Emoji |
|---|---|
| `habit_early_to_rise` | 🌅 |
| `habit_early_to_bed` | 🌙 |
| `habit_stretch` | 💪 |
| `habit_reading` | 📚 |
| `habit_meditation` | 🧘 |
| `habit_water` | 💧 |
| `habit_run` | 🏃 |
| `habit_quit_smoking` | 🚭 |
| *(anything else)* | ⭐ |
