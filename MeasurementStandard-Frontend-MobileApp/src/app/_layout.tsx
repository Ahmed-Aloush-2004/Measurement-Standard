
// import { Stack } from "expo-router";
// import { Provider, useDispatch } from "react-redux";
// import { Alert } from "react-native";
// import { useEffect } from "react";
// // Assuming you have a way to get the token, for example from a store or hook
// import { useSelector } from "react-redux"; 

// import "@/global.css";
// import { store, RootState } from "@/src/store/store";
// import AuthGate from "@/src/components/AuthGate";
// import { connectSocket, disconnectSocket } from "../services/socket";

// // Create an inner component to handle the socket so it has access to Redux state
// function SocketManager({ children }: { children: React.ReactNode }) {
//   // Grab your auth token from Redux (adjust this selector to match your state)
//   const token = useSelector((state: RootState) => state.auth.accessToken);

//   const dispatch = useDispatch()

//   useEffect(() => {
//     // Only attempt connection if the user is authenticated
//     if (!token) return;

//     const socket = connectSocket(token);



//     const handleNotification = (data: {
//       title: string;
//       message: string;
//       type?: string;
//       id:string
//     }) => {
//       console.log('Notification received:', data);

//       Alert.alert(
        
//         data.title,
//         data.message,
//         [
//           {
//             text: 'OK',
//           },
//         ],
//       );

//       dispatch(markNotificationAsRead(''))

      



//     };

//     socket.on('notification', handleNotification);

//     return () => {
//       socket.off('notification', handleNotification);
//       disconnectSocket();
//     };
//   }, [token]); // Re-run if the token changes

//   return <>{children}</>;
// }

// export default function RootLayout() {
//   return (
//     <Provider store={store}>
//       <AuthGate>
//         <SocketManager>
//           <Stack screenOptions={{ headerShown: false }} />
//         </SocketManager>
//       </AuthGate>
//     </Provider>
//   );
// }




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