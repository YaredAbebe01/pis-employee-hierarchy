"use client";

import {
  localStorageColorSchemeManager,
  MantineProvider,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Provider } from "react-redux";
import { useMemo } from "react";

import { store } from "@/lib/store";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const colorSchemeManager = useMemo(
    () =>
      localStorageColorSchemeManager({
        key: "pis-color-scheme",
      }),
    [],
  );

  return (
    <Provider store={store}>
      <MantineProvider
        defaultColorScheme="light"
        colorSchemeManager={colorSchemeManager}
        theme={{
          fontFamily: "Space Grotesk, system-ui, sans-serif",
          headings: { fontFamily: "Space Grotesk, system-ui, sans-serif" },
        }}
      >
        <ModalsProvider>
          <Notifications position="top-right" />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </Provider>
  );
}
