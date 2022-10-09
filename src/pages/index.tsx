import type { NextPage } from "next";
import { FormEvent, Fragment, useRef, useState } from "react";
import { capitalize } from "radash";
import { getInfo } from "../services";
import Download from "../components/Download";

const Home: NextPage = () => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState<any>(null);
  const [segments, setSegments] = useState([]);
  const [playListSource, setPlayListSource] = useState([]);
  const [useProxy, setUseProxy] = useState(false);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isDisabled) return;

    if (inputValue.trim()) {
      setIsDisabled(true);
      setIsLoading(true);
      setIsError(false);

      try {
        const { data, isUseProxy } = await getInfo(inputValue.trim());
        setUseProxy(isUseProxy);

        console.log(data);

        if (data?.playlists?.length) {
          const result = await Promise.all(
            data.playlists.map(async (playlist: any) => {
              const { data } = await getInfo(
                new URL(playlist.uri, inputValue.trim()).href
              );
              return data.segments.map(
                (segment: any) =>
                  new URL(
                    segment.uri,
                    new URL(playlist.uri, inputValue.trim()).href
                  ).href
              );
            })
          );
          setPlayListSource(result as any);
        } else {
          setSegments(
            data?.segments.map(
              (segment: any) => new URL(segment.uri, inputValue.trim()).href
            )
          );
        }
        setData(data);
        setIsLoading(false);
        setIsDisabled(false);
      } catch (error) {
        console.log(error);
        setIsError(true);
        setIsLoading(false);
        setIsDisabled(false);
      }
    }
  };

  return (
    <div className="flex justify-center mx-3">
      <div className="w-full max-w-[600px]">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl mt-8 mb-4 text-center">
            M3U8 To Mp4 Downloader
          </h1>
          <form
            onSubmit={handleFormSubmit}
            className="flex items-stretch w-full"
          >
            <input
              type="url"
              className="outline-none border focus:border-indigo-400 transition py-2 px-3 rounded-l flex-grow"
              placeholder="M3U8 URL"
              required
              autoCorrect="off"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isDisabled || !!data}
            />
            <button
              type="submit"
              className="px-2 flex justify-center items-center gap-1 min-w-[60px] bg-indigo-500 disabled:!brightness-90 hover:brightness-[115%] transition text-white rounded-r"
              disabled={isDisabled || !!data}
            >
              {isLoading && (
                <div className="rounded-full h-5 w-5 border-2 border-white border-t-transparent animate-spin"></div>
              )}
              <span>Download</span>
            </button>
          </form>
          {isError && <p className="text-red-500">Failed to load URL</p>}

          {segments.length > 0 ? (
            <Download segments={segments} useProxy={useProxy} />
          ) : (
            <>
              {data && (
                <>
                  {data?.playlists?.length ? (
                    <div className="w-full flex flex-col items-stretch gap-3">
                      <h2 className="text-2xl mt-3 mb-1">
                        Choose a resolution
                      </h2>
                      {data.playlists.map((playlist: any, index: number) => (
                        <p key={playlist.uri}>
                          <span className="font-semibold">
                            {playlist.uri}:{" "}
                          </span>
                          <span>
                            {Object.entries(playlist.attributes).map(
                              ([key, value]: [key: any, value: any], index) => (
                                <Fragment key={key}>
                                  {index !== 0 && <span>, </span>}
                                  <span>
                                    <>
                                      {capitalize(key)}:{" "}
                                      <span className="text-gray-500">
                                        {typeof value !== "object"
                                          ? value
                                          : Object.entries(value)
                                              .map(
                                                ([key, value]) =>
                                                  `${key}: ${value}`
                                              )
                                              .join(",")}
                                      </span>
                                    </>
                                  </span>
                                </Fragment>
                              )
                            )}
                          </span>
                          <span> </span>
                          <button
                            onClick={() => setSegments(playListSource[index])}
                            className="text-blue-500"
                          >
                            Download
                          </button>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <h3>Failed to parse</h3>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
