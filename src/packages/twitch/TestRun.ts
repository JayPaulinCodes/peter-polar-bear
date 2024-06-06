// require("dotenv").config();
// import { TwitchAPI } from "./api/TwitchAPI";
// import { TwitchSocket } from "./socket/TwitchSocket";


// (async () => {
    // const socket = new TwitchSocket({
    //     clientId: process.env.TWITCH_CLIENT_ID ?? "",
    //     clientSecret: process.env.TWITCH_CLIENT_SECRET ?? "",
    //     clientAccessToken: process.env.TWITCH_CLIENT_ACCESS ?? ""
    // });

//     socket.tryAddSteamOnlineSub("DevDaddyJacob");
//     socket.on("StreamOnline", (event) => {
//         console.log(`${event.payload.event.broadcaster_user_name} went live`)
//     });
// })()