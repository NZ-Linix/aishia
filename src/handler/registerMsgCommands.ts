import "dotenv/config";
import { Client } from "discord.js";
import config from "../config";
import fs from "fs";
import chalk from "chalk";

import listenerMsgCommands from "./listenerMsgCommands";

const handlerRegisterMsgCommands = async (client: Client) => {

    if (!client.isReady()) {
        await new Promise((resolve) => client.once("ready", resolve));
    }
        
    const commands = new Map();
    
    for (const directory of fs.readdirSync("./src/commands")) {
    
        for (const file of fs.readdirSync("./src/commands/" + directory).filter((f) => f.endsWith(".ts"))) {

            try {
    
                const fileContents = fs.readFileSync(`./src/commands/${directory}/${file}`, "utf-8");

                if (!fileContents.startsWith("//_MESSAGE_COMMAND")) {continue;}

                const module = await import(`../commands/${directory}/${file}`);
                const command = module.default;
                commands.set(command.data.name, command);

                if ( config.guildId !== "" ) {

                    if (!client.user?.id) return;

                    await commands.set(command.data.name, command);

                } else {

                    if (!client.user?.id) return;

                    await commands.set(command.data.name, command);

                }

            } catch ( err ) {
                
                console.log(chalk.red.bold("[🌿]") + " " + chalk.red("There was an error while registering a message command."));
                console.log()
                console.log(chalk.grey("------------------------------"))
                console.log()
                console.log(err);
                console.log()
                console.log(chalk.grey("------------------------------"))

            }

        }

    }

    if (  config.guildId !== "" ) {

        listenerMsgCommands(client, commands, true);

    } else {

        listenerMsgCommands(client, commands, false);

    }

}

export default handlerRegisterMsgCommands;