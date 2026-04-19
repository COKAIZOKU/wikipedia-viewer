"use client";

import { useEffect, useState } from "react";
import {
  TextInput,
  ActionIcon,
  Button,
  Loader,
  Transition,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconArrowRight,
  IconSearch,
  IconArrowUpRight,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import Background from "./svg/background";

export default function Home() {
  
  /* Dark/Light mode */
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleColorScheme = () => {
    setColorScheme(activeColorScheme === "light" ? "dark" : "light");
  };
  
  const activeColorScheme = mounted ? computedColorScheme : "light";
  
  /* API related variables */
  const [value, setValue] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
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

  /* Shorten the description fetched */
  const firstSentence = (text, fallbackMaxLen = 280) => {
    if (!text) return text;
    const match = text.match(/(.+?[.!?])(\s|$)/);
    if (match?.[1]) return match[1].trim();
    if (text.length <= fallbackMaxLen) return text;
    return text.slice(0, fallbackMaxLen).trimEnd() + "...";
  };

  /* Fetching MediaWiki API */
  const url = "https://en.wikipedia.org/w/api.php";
  const params = new URLSearchParams({
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
      /* console.log("API response:", searchResponse); */

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
        /* console.log("Extracts response:", extractsResponse); */
        nextExtracts = extractsResponse?.query?.pages || {};
      }

      setExtracts(nextExtracts);
      setResponse(searchResponse);
      setData(searchResponse);
    } /* catch (error) {
        console.log(error);
    } */ finally {
      setLoading(false);
    }
  };

  /* Load the information */
  const handleClick = (title) => {
    const articleUrl =
      "https://en.wikipedia.org/wiki/" +
      encodeURIComponent(title.replaceAll(" ","_"));
    window.open(articleUrl, "_blank", "noopener,noreferrer");
  };

  /* Random Article */
  const paramsRandom = {
    action: "query",
    format: "json",
    rnlimit: "1",
    list: "random",
    rnnamespace: "0",
  };

  let urlRandom = url + "?origin=*";
  Object.keys(paramsRandom).forEach(function (key) {
    urlRandom += "&" + key + "=" + paramsRandom[key];
  });

  const handleRandom = () => {
    fetch(urlRandom)
      .then(function (responseRandom) {
        return responseRandom.json();
      })
      .then(function (responseRandom) {
        let randoms = responseRandom.query.random;
        /* console.log(responseRandom); */
        const title = randoms[0].title;
        const randomUrl =
          "https://en.wikipedia.org/wiki/" +
          encodeURIComponent(title.replaceAll(" ", "_"));
        window.open(randomUrl, "_blank", "noopener,noreferrer");
      })
      /* .catch(function (error) {
        console.log(error);
      }); */
  };

  return (
    <div className="bg-white dark:bg-zinc-950 relative flex min-h-screen items-center justify-center overflow-hidden font-sans">
      <div className="pointer-events-none fixed absolute inset-0 flex items-center justify-center">
        <Background />
      </div>
      <div className="fixed right-4 top-4 z-20">
        <ActionIcon
          onClick={toggleColorScheme}
          variant="transparent"
          size="md"
          radius="lg"
        >
          {activeColorScheme === "dark" ? (
            <IconSun className="text-white" size={18} stroke={1.5} />
          ) : (
            <IconMoon className="text-zinc-950" size={18} stroke={1.5} />
          )}
        </ActionIcon>
      </div>
      <main className="relative z-10 gap-2 flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center items-start text-left w-full">
          <h1 className="mb-3 text-5xl font-bold leading-10 tracking-tight w-full dark:text-white">
            Wikipedia <br></br> Viewer.
          </h1>
        </div>
        <div className="grid grid-cols-12 flex flex-col gap-4 sm:flex-row w-full">
          <div className="col-span-12 md:col-span-8">
            <TextInput
              w="100%"
              variant="unstyled"
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
              size="md"
              radius="xl"
              label="Search"
              classNames={{
                input: "!bg-zinc-100 dark:!bg-[#0D0D0F]",
                label: "dark:text-white",
              }}
              description="for a Wikipedia article."
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSubmit();
                }
              }}
              leftSection={<IconSearch size={18} stroke={1.5} />}
              rightSection={
                loading ? (
                  <Loader color="gray" size={18} />
                ) : (
                  <ActionIcon
                    size={32}
                    radius="xl"
                    variant="filled"
                    color="#171717"
                    aria-label="Search"
                    onClick={handleSubmit}
                  >
                    <IconArrowRight
                      className="text-zinc"
                      size={18}
                      stroke={1.5}
                    />
                  </ActionIcon>
                )
              }
            />
          </div>
          <div className="col-span-12 md:col-span-4 mt-auto">
            <Button
              onClick={handleRandom}
              size="md"
              color="#171717"
              className="mt-auto btn-hover"
              variant="filled"
              radius="xl"
              fullWidth
            >
              <span className="label">Random Article</span>
              <IconArrowUpRight
                className="btn-icon translate-y-[1px]"
                size={20}
              />
            </Button>
          </div>
        </div>
        {data && (
          <p className="flex flex-col w-full text-zinc-400 dark:text-white-300 text-sm mb-4">
            Found {data.query?.search?.length || 0}{" "}
            {data.query?.search?.length === 1 ? "article" : "articles"}.{" "}
          </p>
        )}
        {response?.query?.search?.map((item, idx) => {
          const articleUrl =
            "https://en.wikipedia.org/wiki/" +
            encodeURIComponent(item.title.replaceAll(" ", "_"));
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
                    <p className="text-2xl dark:text-white text-zinc font-semibold tracking-tight">
                      <span>{idx + 1}.</span>
                    </p>
                    <p className="text-2xl dark:text-white text-zinc font-semibold tracking-tight">
                      {item.title}
                    </p>
                  </div>
                  <p className="text-md text-justify dark:text-white tracking-tight w-full">
                    {shortExtract}
                  </p>
                  <button
                    onClick={() => handleClick(item.title)}
                    className="text-zinc-400 dark:text-zinc-500 gap-[2px] flex underline cursor-pointer transition-opacity hover:opacity-70"
                  >
                    <span className="text-xs">{articleUrl}</span>
                    <IconArrowUpRight className="mt-[2px]" size={14} />
                  </button>
                </div>
              )}
            </Transition>
          );
        })}
      </main>
    </div>
  );
}
