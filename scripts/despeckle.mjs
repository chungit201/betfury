// Drops floating specks from an RGBA buffer that has already been cut out.
//
// Generated frames routinely carry a stray highlight or a torn fragment that
// belongs to nothing — a smear of light in a corner, a shard of the backdrop
// the cutter could not classify. Once the matte is gone these survive as
// islands, and because a cutout is normally trimmed to its bounding box, a
// single 20px speck can push the whole crop out and leave visible junk on the
// page.
//
// Anything forming its own connected blob smaller than `minFraction` of the
// frame is one of those: the subject is a single large blob, and even small
// deliberate details like floating coins are several times this size.
//
// Both cutters need this, which is why it lives on its own rather than inside
// either of them.

// Alpha below this counts as empty when grouping the image into blobs.
const SOLID = 24;

export function despeckleAlpha(raw, width, height, minFraction = 0.0015) {
  const minArea = Math.round(width * height * minFraction);
  const seen = new Uint8Array(width * height);
  let dropped = 0;

  for (let start = 0; start < width * height; start++) {
    if (seen[start] || raw[start * 4 + 3] < SOLID) continue;
    const blob = [];
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      const p = stack.pop();
      blob.push(p);
      const x = p % width;
      const y = (p - x) / width;
      const neighbours = [];
      if (x > 0) neighbours.push(p - 1);
      if (x < width - 1) neighbours.push(p + 1);
      if (y > 0) neighbours.push(p - width);
      if (y < height - 1) neighbours.push(p + width);
      for (const n of neighbours) {
        if (seen[n] || raw[n * 4 + 3] < SOLID) continue;
        seen[n] = 1;
        stack.push(n);
      }
    }
    if (blob.length >= minArea) continue;
    for (const p of blob) raw[p * 4 + 3] = 0;
    dropped += blob.length;
  }
  return dropped;
}
