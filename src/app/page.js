"use client";

import { useEffect, useState } from "react";
import {
  TextInput,
  ActionIcon,
  Button,
  Loader,
  Transition,
} from "@mantine/core";
import {
  IconArrowRight,
  IconSearch,
  IconArrowUpRight,
} from "@tabler/icons-react";
import Background from "./svg/background";

export default function Home() {
  const [value, setValue] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false); // idk if im going to use it
  const [data, setData] = useState(null);
  const [extracts, setExtracts] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!response) {
      setShowResults(false);
      return;
    }

    setShowResults(false);
    const frameId = requestAnimationFrame(() => {
      setShowResults(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, [response]);

  const firstSentence = (text, fallbackMaxLen = 280) => {
    if (!text) return text;
    const match = text.match(/(.+?[.!?])(\s|$)/);
    if (match && match[1]) return match[1].trim();
    if (text.length <= fallbackMaxLen) return text;
    return text.slice(0, fallbackMaxLen).trimEnd() + "...";
  };

  var url = "https://en.wikipedia.org/w/api.php";
  var params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: value,
    format: "json",
    origin: "*",
  });

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const searchRes = await fetch(`${url}?${params}`);
      const searchResponse = await searchRes.json();
      console.log("API response:", searchResponse);

      const pageids = (searchResponse.query?.search || [])
        .map((x) => x.pageid)
        .join("|");

      let nextExtracts = {};

      if (pageids) {
        const extractParams = new URLSearchParams({
          action: "query",
          prop: "extracts",
          exintro: "true",
          explaintext: "true",
          exsentences: "1",
          exlimit: "max",
          redirects: "true",
          pageids,
          format: "json",
          origin: "*",
        });

        const extractRes = await fetch(
          `https://en.wikipedia.org/w/api.php?${extractParams.toString()}`,
        );
        const extractsResponse = await extractRes.json();
        console.log("Extracts response:", extractsResponse);
        nextExtracts = extractsResponse?.query?.pages || {};
      }

      setExtracts(nextExtracts);
      setResponse(searchResponse);
      setData(searchResponse);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const handleClick = (title) => {
    const articleUrl =
      "https://en.wikipedia.org/wiki/" +
      encodeURIComponent(title.replace(/ /g, "_"));
    window.open(articleUrl, "_blank", "noopener,noreferrer");
  };

  var paramsRandom = {
    action: "query",
    format: "json",
    rnlimit: "1",
    list: "random",
    rnnamespace: "0",
  };

  var urlRandom = url + "?origin=*";
  Object.keys(paramsRandom).forEach(function (key) {
    urlRandom += "&" + key + "=" + paramsRandom[key];
  });
  const handleRandom = () => {
    fetch(urlRandom)
      .then(function (responseRandom) {
        return responseRandom.json();
      })
      .then(function (responseRandom) {
        var randoms = responseRandom.query.random;
        console.log(responseRandom);
        const title = randoms[0].title;
        const randomUrl =
          "https://en.wikipedia.org/wiki/" +
          encodeURIComponent(title.replace(/ /g, "_"));
        window.open(randomUrl, "_blank", "noopener,noreferrer");
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden font-sans dark:bg-black">
      <div className="pointer-events-none fixed absolute inset-0 flex items-center justify-center">
        <Background />
      </div>
      <main className="relative z-10 gap-2 flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center items-start text-left w-full">
          <h1 className="mb-3 text-5xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50 w-full">
            Wikipedia <br></br> Viewer.
          </h1>
        </div>
        <div className="grid grid-cols-12 flex flex-col gap-4 sm:flex-row w-full">
          <div className="col-span-12 md:col-span-8">
            <TextInput
              w="100%"
              variant="filled"
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
              size="md"
              radius="xl"
              label="Search"
              description="for a Wikipedia article."
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSubmit();
                }
              }}
              leftSection={<IconSearch size={18} stroke={1.5} />}
              rightSection={
                <ActionIcon
                  size={32}
                  radius="xl"
                  variant="filled"
                  color="#212529"
                  aria-label="Search"
                  onClick={handleSubmit}
                >
                  <IconArrowRight size={18} stroke={1.5} />
                </ActionIcon>
              }
            />
          </div>
          <div className="col-span-12 md:col-span-4 mt-auto">
            <Button
              onClick={handleRandom}
              color="#212529"
              size="md"
              className="mt-auto btn-hover"
              variant="filled"
              radius="xl"
              fullWidth
            >
              <span className="label">Random Article</span>
              <IconArrowUpRight className="btn-icon translate-y-[1px]" size={20}/>
            </Button>
          </div>
        </div>
        {data && (
          <p className="flex flex-col w-full text-zinc-400 text-sm mb-4">
            Found {data.query?.search?.length || 0}{" "}
            {data.query?.search?.length === 1 ? "article" : "articles"}.{" "}
          </p>
        )}
        {response?.query?.search?.map((item, idx) => {
          const articleUrl =
            "https://en.wikipedia.org/wiki/" +
            encodeURIComponent(item.title.replace(/ /g, "_"));
          const extract = extracts?.[item.pageid]?.extract;
          const shortExtract = firstSentence(extract, 320);
          return (
            <Transition
              key={item.pageid}
              mounted={showResults}
              transition="fade-up"
              duration={500}
              timingFunction="ease"
            >
              {(styles) => (
                <div
                  style={styles}
                  className="gap-1 mb-8 flex flex-col sm:flex-col w-full"
                >
                  <div className="flex justify gap-2">
                    <p className="text-2xl font-semibold tracking-tight text-black">
                      <span>{idx + 1}.</span>
                    </p>
                    <p className="text-2xl font-semibold tracking-tight text-black">
                      {item.title}
                    </p>
                  </div>
                  <p className="text-md text-justify tracking-tight text-black dark:text-zinc-50 w-full">
                    {shortExtract}
                  </p>
                  <div
                    justify="space-between"
                    onClick={() => handleClick(item.title)}
                    className="text-zinc-400 gap-[2px] flex underline cursor-pointer text-xs transition-opacity hover:opacity-70"
                  >
                    <span>{articleUrl}</span>
                    <IconArrowUpRight className="mt-[2px]" size={14}/> 
                  </div>
                </div>
              )}
            </Transition>
          );
        })}
      </main>
    </div>
  );
}
