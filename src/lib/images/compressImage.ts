/**
 * Downscale and re-encode a photo in the browser before upload.
 * Phone camera shots are 3-12 MB; a 1280px JPEG is ~150-300 KB, which cuts
 * Supabase storage and feed egress ~10x with no server-side plan dependency.
 * Falls back to the original file on any failure, so uploads never break.
 */
export async function compressImage(
  file: File,
  maxDimension = 1280,
  quality = 0.8,
): Promise<File> {
  try {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))

    // Already small enough — skip the re-encode round trip
    if (scale === 1 && file.size < 400_000) {
      bitmap.close()
      return file
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    )
    if (!blob || blob.size >= file.size) return file

    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}
