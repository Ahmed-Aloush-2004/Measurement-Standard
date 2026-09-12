import { Stack } from "expo-router";
import { Provider } from "react-redux";

import "@/global.css";
import { store } from "@/src/store/store";
import AuthGate from "@/src/components/AuthGate";

export default function RootLayout() {

  return (
    <Provider store={store}>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGate>
    </Provider>
  );

}
