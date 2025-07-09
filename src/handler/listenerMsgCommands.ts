import "dotenv/config";
import { Client, Message } from "discord.js";
import chalk from "chalk";
import config from "../config";

const listenerMsgCommands = async (client: Client, commands: Map<any, any>, guildOnly: boolean) => {

    await client.on("messageCreate", async (message: Message) => {

        if (message.author.bot) return;

        if ( guildOnly ) {

            if ( message.guild?.id !== config.guildId ) return;

        }

        if ( !message.content.startsWith(config.messageCommandPrefix) ) return;

        const commandName = message.content.slice(config.messageCommandPrefix.length).split(" ")[0];
        const command = commands.get(commandName);

        if ( !command ) return;

        try {

            await command.execute(message, client, message.content.split(" ").slice(1));

        } catch ( err ) {
            
            console.log(chalk.red.bold("[🌿]") + " " + chalk.red("There was an error while executing /" + message.content.split(" ")[0].slice(config.messageCommandPrefix.length)));
            console.log()
            console.log(chalk.grey("------------------------------"))
            console.log()
            console.log(err);
            console.log()
            console.log(chalk.grey("------------------------------"))

            return;

        }

    });

}

export default listenerMsgCommands;