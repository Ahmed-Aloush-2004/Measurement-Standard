

import { Stack } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Alert } from "react-native";
import { useEffect } from "react";

import "@/global.css";
import { store, RootState, AppDispatch } from "@/src/store/store";
import AuthGate from "@/src/components/AuthGate";
import { connectSocket, disconnectSocket } from "../services/socket";
import { fetchNotifications, markNotificationAsRead } from "../store/notificationsSlice";

function SocketManager({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    const handleNotification = (
      data: {
      id: string;
      title: string;
      message: string;
      type?: string;
    }
  ) => {

      Alert.alert(
        data.title,
        data.message,
        [
          {
            text: "OK",
            onPress: () => {
              if (data.id) {
                dispatch(markNotificationAsRead(data.id));
              }
            },
          },
        ],
        { cancelable: false }
      );


    dispatch(fetchNotifications()); // Fetch notifications when screen comes into focus


    };

    

    socket.on("notification", handleNotification);




    return () => {
      socket.off("notification", handleNotification);
      disconnectSocket();
    };
  }, [token, dispatch]);


  

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthGate>
        <SocketManager>
          <Stack screenOptions={{ headerShown: false }} />
        </SocketManager>
      </AuthGate>
    </Provider>
  );
}