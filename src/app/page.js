"use client";

import Image from "next/image";
import { useState } from "react";
import { TextInput, ActionIcon } from "@mantine/core";
import { IconArrowRight, IconSearch } from '@tabler/icons-react';

export default function Home() {
  const [value, setValue] = useState('');
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Wikipedia <br></br> Viewer.
          </h1>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <TextInput
            variant="filled"
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            size="md"
            radius="xl"
            label="Search"
            description="for a Wikipedia article."
            rightSection={
              <ActionIcon 
              size={32}
              radius="xl"
              variant="filled"
              aria-label="Search"
              >
              <IconArrowRight size={18} stroke={1.5} />
              </ActionIcon>
            }
          />
        </div>
      </main>
    </div>
  );
}
