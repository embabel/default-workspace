# Channels

External messaging channel configurations. Each `.yml` file defines a channel integration that allows the assistant to communicate beyond the web UI.

```yml
type: com.embabel.assistant.channel.telegram.TelegramChannelConfig
name: telegram
token-env: TELEGRAM_BOT_TOKEN
```

Use `token-env` to reference an environment variable or workspace secret for the channel credential.
