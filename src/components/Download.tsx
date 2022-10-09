import { FC, useEffect, useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { parallel } from "radash";
import { urlWithProxy } from "../utils/proxy";
import { forceDownloadFile } from "../utils/download";

interface DownloadProps {
  segments: string[];
  useProxy: boolean;
}

const Download: FC<DownloadProps> = ({ segments, useProxy }) => {
  const [message, setMessage] = useState("Loading video rendering library...");
  const [filePreview, setFilePreview] = useState("");

  useEffect(() => {
    (async () => {
      const ffmpeg = createFFmpeg({
        log: true,
        corePath: "https://unpkg.com/@ffmpeg/core/dist/ffmpeg-core.js",
      });

      await ffmpeg.load();

      setMessage(`Downloading segments (0 / ${segments.length})`);

      let count = 0;
      await parallel(
        10,
        segments.map((segment, index: any) => [index, segment]),
        async ([index, segment]) => {
          ffmpeg.FS(
            "writeFile",
            `${index + 1}.ts`,
            await fetchFile(useProxy ? urlWithProxy(segment) : segment)
          );
          setMessage(`Downloading segments (${++count} / ${segments.length})`);
        }
      );

      setMessage("Rendering video...");

      ffmpeg.FS(
        "writeFile",
        "list.txt",
        new Array(segments.length)
          .fill("")
          .map((_, index) => `file '${index + 1}.ts'`)
          .join("\n")
      );

      await ffmpeg.run(
        "-f",
        "concat",
        "-i",
        "list.txt",
        "-c",
        "copy",
        "all.ts"
      );
      await ffmpeg.run(
        "-i",
        "all.ts",
        "-acodec",
        "copy",
        "-vcodec",
        "copy",
        "all.mp4"
      );
      const data = ffmpeg.FS("readFile", "all.mp4");

      const objectURL = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );

      setFilePreview(objectURL);
      setMessage("Convert complete");

      forceDownloadFile(objectURL);
    })();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="w-full">
      <p className="text-lg my-4">{message}</p>

      {filePreview && (
        <video src={filePreview} muted autoPlay width="100%" controls></video>
      )}
    </div>
  );
};

export default Download;
