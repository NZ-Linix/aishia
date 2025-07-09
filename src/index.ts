// @src/index.ts -> Main entry point -----------------------------------------------
//
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// Made by @NZ-Linix on GitHub
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
//
// ---------------------------------------------------------------------------------

// Imports -------------------------------------------------------------------------

import "dotenv/config";
import { 
    Client,
    GatewayIntentBits,
    Collection,
    Partials,
    Events,
    ActivityType 
} from "discord.js";

import * as db from "./handler/database";

import express from "express";
const portStr = process.env.PORT || "8000";
const port = parseInt(portStr) || 8000;

// Load console colors -------------------------------------------------------------

import chalk from "chalk";
import config from "./config";

// Create client -------------------------------------------------------------------

const client = new Client({ 
    intents: 53608447,
    partials: [
        Partials.User,
        Partials.ThreadMember,
        Partials.SoundboardSound,
        Partials.Reaction,
        Partials.Message,
        Partials.GuildScheduledEvent,
        Partials.GuildMember,
        Partials.Channel,
    ]
})

console.log()

// Ready event ---------------------------------------------------------------------

client.once(Events.ClientReady, async () => {

    setTimeout(() => {
        console.log(chalk.green.bold("[🌿]") + " " + "Application is ready.");
        console.log()

    }, 10);

});

// Status rotations ----------------------------------------------------------------

if ( config.status.rotations.length > 0 ) {

    let i = 0;

    setInterval(async () => {

        const MAINTENANCE_MODE = await db.get("maintenanceMode");

        if ( MAINTENANCE_MODE ) {

            const status = await db.get("maintenanceStatus");
            await client.user?.setPresence({ activities: [{ name: status, type: ActivityType.Custom }], status: "online" });
            return;
            
        }

        if ( i >= config.status.rotations.length ) {
            i = 0;
        }

        await client.user?.setPresence({ activities: [{ name: config.status.rotations[i], type: ActivityType.Custom }], status: "online" });

        i++;

    }, 5 * 1000);

}

// Execute listener and handlers ---------------------------------------------------

import handlerRegisterSlashCommands from "./handler/registerSlashCommands";
handlerRegisterSlashCommands(client);

import handlerRegisterMsgCommands from "./handler/registerMsgCommands";
handlerRegisterMsgCommands(client);

import eventHandler from "./handler/eventHandler";
eventHandler(client);

const app = express();

app.get("/", (req: express.Request, res: express.Response) => {

    res.status(200).json({
        code: 200,
        status: "OK",
        message: "API is running.",
    });

});

// Login to Discord ----------------------------------------------------------------

console.log(chalk.blue.bold("[🌿]") + " " + "Attempting Starting HTTPS Server...")
app.listen(port, () => {
    console.log(chalk.green.bold("[🌿]") + " " + "API is listening on port " + port + ".");
});

console.log(chalk.blue.bold("[🌿]") + " " + "Attempting Login...")
client.login(process.env.CLIENT_TOKEN).then(async () => {

    console.log(chalk.green.bold("[🌿]") + " " + "Logged in as " + chalk.green.bold(client.user?.username) + ".");

}).catch((err) => {

    console.log(chalk.red.bold("[🌿]") + " " + chalk.red("Failed to login."));
    console.log()
    console.log(chalk.grey("------------------------------"))
    console.log()
    console.log(err);
    console.log()
    console.log(chalk.grey("------------------------------"))

    return;

});