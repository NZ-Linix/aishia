//_SLASH_COMMAND

import { SlashCommandBuilder, Client, ChatInputCommandInteraction, MessageFlags } from "discord.js";

import server_setup from "../../scripts/server_set_apikey.ts";

export default {

    data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Toggle features")
    .addSubcommandGroup( group => group
        .setName("features")
        .setDescription("Toggle features")
    )
    .addSubcommandGroup( group => group 
        .setName("settings")
        .setDescription("Change settings")
        .addSubcommand( subcommand => subcommand
            .setName("set-apikey")
            .setDescription("Setup AISHIA. The bot will not work without setup.")
        )
    ),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        const subcommand = interaction.options.getSubcommand();

        if ( subcommand === "set-apikey" ) {

            await server_setup(client, interaction);

            return;

        } else {

            await interaction.reply({ content: "Unknown subcommand", flags: MessageFlags.Ephemeral });

        }

    }

}