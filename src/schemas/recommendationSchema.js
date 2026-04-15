import { z } from "zod";

export const recommendationSchema = z.object({
  detectedTitle: z.string(),
  detectedArtist: z.string(),
  playlistName: z.string(),
  songs: z.array(
    z.object({
      title: z.string(),
      artist: z.string()
    })
  ).length(10)
});