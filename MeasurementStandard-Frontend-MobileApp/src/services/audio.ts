





// // Initialize and play the notification sound
//   export  const playSound = async () => {
//       try {
//         const { sound } = await Audio.Sound.createAsync(
//           require("@/assets/sounds/notification.mp3")
//         );
//         await sound.playAsync();

//         // Unload the sound from memory once it finishes playing
//         sound.setOnPlaybackStatusUpdate((status) => {
//           if (status.isLoaded && status.didJustFinish) {
//             sound.unloadAsync();
//           }
//         });
//       } catch (error) {
//         console.error("Error playing notification sound:", error);
//       }
//     };