//_SLASH_COMMAND

import { SlashCommandBuilder, Client, ChatInputCommandInteraction, MessageFlags } from "discord.js";

import user_clearHistory from "../../scripts/user_clearHistory";
import user_viewHistory from "../../scripts/user_viewHistory";
import user_saveHistory from "../../scripts/user_saveHistory";
import user_loadHistory from "../../scripts/user_loadHistory";
import user_deleteHistory from "../../scripts/user_deleteHistory";

export default {

    data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Commands for users")
    .addSubcommandGroup( group => group
        .setName("actions")
        .setDescription("A list of actions to use")
        .addSubcommand( subcommand => subcommand
            .setName("clear-history")
            .setDescription("Clear your message history")
        )
        .addSubcommand( subcommand => subcommand
            .setName("view-history")
            .setDescription("View your message history")
        )
        .addSubcommand( subcommand => subcommand
            .setName("save-chat")
            .setDescription("Save your current chat history")
            .addStringOption( option => option
                .setName("name")
                .setDescription("The name of the chat")
                .setRequired(true)
            )
        )
        .addSubcommand( subcommand => subcommand
            .setName("load-chat")
            .setDescription("Load a saved chat history")
            .addStringOption( option => option
                .setName("name")
                .setDescription("The name of the chat")
                .setRequired(true)
            )
            .addBooleanOption( option => option
                .setName("confirm")
                .setDescription("!!! This will overwrite your current chat history !!!")
                .setRequired(true)
            )
        )
        .addSubcommand( subcommand => subcommand
            .setName("delete-chat")
            .setDescription("Delete a saved chat history")
            .addStringOption( option => option
                .setName("name")
                .setDescription("The name of the chat")
                .setRequired(true)
            )
        )
        .addSubcommand( subcommand => subcommand
            .setName("clear-memory")
            .setDescription("Clear the AI's memory")
        )
    ),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "clear-history") {

            await user_clearHistory.runScript(client, interaction);

            return;

        } else if ( subcommand === "view-history" ) {

            await user_viewHistory.runScript(client, interaction);
            return;
        
        } else if ( subcommand === "save-chat" ) {

            await user_saveHistory.runScript(client, interaction);
            return;

        } else if ( subcommand === "load-chat" ) {

            await user_loadHistory.runScript(client, interaction);
            return;

        } else if (  subcommand === "delete-chat" ) {

            await user_deleteHistory.runScript(client, interaction);
            return;
        
        }
        
        else {

            await interaction.reply({ content: "Unknown subcommand", flags: MessageFlags.Ephemeral });

        }

    }

}