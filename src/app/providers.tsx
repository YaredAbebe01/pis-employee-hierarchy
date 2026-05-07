"use client";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Provider } from "react-redux";

import { store } from "@/lib/store";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <MantineProvider
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
