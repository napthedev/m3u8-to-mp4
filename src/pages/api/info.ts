// @ts-ignore
import { Parser } from "m3u8-parser";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const url = req.query.url;
    if (!url || typeof url !== "string")
      return res.status(400).send("Missing url param");

    const { data: source, headers } = await axios.get(url);

    if (
      ![
        "audio/x-mpegurl",
        "video/m3u",
        "video/m3u8",
        "video/hls",
        "application/x-mpegurl",
        "vnd.apple.mpegurl",
        "video/mp2t",
        "application/vnd.apple.mpegurl",
      ].includes(headers["content-type"]?.toLowerCase() || "")
    )
      return res.status(400).send("File is not m3u8");

    const parser = new Parser();

    parser.push(source);
    parser.end();

    const manifest = parser.manifest;

    if (!manifest?.segments?.length && !manifest?.playlists?.length)
      return res.status(400).send("Invalid m3u8");

    res.status(200).json(parser.manifest);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
}
