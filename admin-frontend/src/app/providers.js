"use client";

import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import { store } from "@/lib/store";
import AuthInitializer from "@/components/common/AuthInitializer";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
          }}
        />
      </AuthInitializer>
    </Provider>
  );
}
