import axios from "axios";
import { urlWithProxy } from "../utils/proxy";

export const getInfo = async (url: string) => {
  let isUseProxy = false;
  const { data } = await axios
    .get(`/api/info?url=${encodeURIComponent(url)}`)
    .catch(async () => {
      isUseProxy = true;
      const { data } = await axios.get(
        `/api/info?url=${encodeURIComponent(urlWithProxy(url))}`
      );
      return { data };
    });

  return { data, isUseProxy };
};
