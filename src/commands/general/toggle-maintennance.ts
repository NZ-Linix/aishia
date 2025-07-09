//_SLASH_COMMAND

import { SlashCommandBuilder, EmbedBuilder, Client, ChatInputCommandInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType, Embed, ContainerBuilder, TextDisplayBuilder, Message, MessageFlags } from "discord.js";
import * as db from "../../handler/database";
import { stringInput } from "../../util";

export default {

    data: new SlashCommandBuilder()
        .setName("toggle-maintenance")
        .setDescription("Toggle the maintenance mode of AISHIA."),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        if ( interaction.user.id !== "968131311699120169" ) {

            const noPermissionEmbed = new EmbedBuilder()
                .setDescription("You do not have permission to use this command.")
                .setColor("Blurple");

            await interaction.reply({ embeds: [noPermissionEmbed], flags: MessageFlags.Ephemeral });
            return;

        }

        const maintenanceMode = await db.get("maintenanceMode");

        if (  maintenanceMode ) {

            db.remove("maintenanceMode");
            db.remove("maintenanceStatus");

            const container = new ContainerBuilder()
            .addTextDisplayComponents( new TextDisplayBuilder().setContent("**AISHIA Maintenance Mode - OFF**") )

            await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            return;

        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.deleteReply();

        const status = await stringInput(client, interaction, "Please enter the maintenance status message.", { deleteUser: true, deleteBot: true });

        await db.set("maintenanceMode", true);
        await db.set("maintenanceStatus", (status as Message).content);

        const container = new ContainerBuilder()
        .addTextDisplayComponents( new TextDisplayBuilder().setContent("**AISHIA Maintenance Mode - ON**") )

        if ( !interaction.channel?.isSendable() ) return;

        await interaction.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        return;

    }

}