import "dotenv/config";
import { Client, Interaction } from "discord.js";
import chalk from "chalk";
import config from "../config";

const listenerSlashCommands = async (client: Client, commands: Map<any, any>) => {

    await client.on("interactionCreate", async (interaction: Interaction) => {

        if ( !interaction.isChatInputCommand() ) return;

        const command = commands.get(interaction.commandName);

        if ( !command ) return;

        try {

            const subcommandGroup = interaction.options.getSubcommandGroup(false);
            const subcommand      = interaction.options.getSubcommand(false);
            
            let commandLog = chalk.blue.bold("[🌿]") + " " + chalk.blue("[" + interaction.user.username + "] /" + interaction.commandName);
            if (subcommandGroup) commandLog += " " + chalk.blue(subcommandGroup);
            if (subcommand) commandLog += " " + chalk.blue(subcommand);
            console.log(commandLog);
            await command.execute(interaction, client);

        } catch ( err ) {
            
            console.log(chalk.red.bold("[🌿]") + " " + chalk.red("There was an error while executing /" + interaction.commandName));
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

export default listenerSlashCommands;