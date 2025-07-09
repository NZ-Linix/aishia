import { Client, Events } from "discord.js";
import config from "../config";
import fs from "fs";
import chalk from "chalk";

const eventHandler = async (client: Client) => {

    if (!client.isReady()) {
        await new Promise((resolve) => client.once("ready", resolve));
    }
    
    for (const directory of fs.readdirSync("./src/events")) {

        if ( directory == ".DS_Store" ) { continue; }
    
        for (const file of fs.readdirSync("./src/events/" + directory).filter((f) => f.endsWith(".ts"))) {

            try {

                const module = await import(`../events/${directory}/${file}`);
                const event = module.default;

                if (event.data.once) {
                    client.once(event.data.event, (...args) => event.execute(client, ...args));
                }

                if (!event.data.once) {
                    client.on(event.data.event, (...args) => event.execute(client, ...args));
                }

            } catch ( err ) {
                
                console.log(chalk.red.bold("[🌿]") + " " + chalk.red("There was an error while registering an event."));
                console.log()
                console.log(chalk.grey("------------------------------"))
                console.log()
                console.log(err);
                console.log()
                console.log(chalk.grey("------------------------------"))

            }

        }

    }

}

export default eventHandler;