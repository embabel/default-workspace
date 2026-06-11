---
name: images
description: Workspace image management — list, look up, annotate, find by location. For "show my images", "annotate image X", "photos near X", "describe this picture".
---

# Images

> **Use `gateway.images.*`.**

```ts
gateway.images.listImages({})                              // all images: filename, date, description, tags
gateway.images.getImageDetails({ filename })               // full metadata for one image
gateway.images.annotateImage({ filename, description, tags? })  // set/update description + tags
gateway.images.nearImages({ lat, lon, radius_km? })        // EXIF-GPS-based location search; default radius 5km
```

`tags` is a comma-separated string. `lat`/`lon` are strings (not numbers
— the gateway expects strings). Photos without GPS are excluded from
`nearImages` results.

## Embedding images in chat

Markdown image syntax embeds a workspace-served image inline. The
serving path is `/api/v1/images/<filename>` (substitute the actual
filename from `listImages` / `getImageDetails`). Build the path with
string concatenation in your script and emit it via `send_message`.

## Patterns

```js
// What images do I have?
const list = await gateway.images.listImages({});
await platform.send_message(list);

// Annotate after analysis
await gateway.images.annotateImage({
  filename: "beach.jpg",
  description: "Sunset over Bondi",
  tags: "beach,sunset,australia",
});

// Find nearby (lat/lon as strings)
const nearby = await gateway.images.nearImages({
  lat: "-33.8915", lon: "151.2767", radius_km: "10",
});
```
