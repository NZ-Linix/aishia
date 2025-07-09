import { EmbedBuilder, Client, ChatInputCommandInteraction, MessageFlags, TextDisplayBuilder, ContainerBuilder } from "discord.js";
import * as db from "../handler/database";

export default {

    runScript: async (client: Client, interaction: ChatInputCommandInteraction) => {

        const userId = interaction.user.id;

        const guildId = interaction.guild?.id;

        if (!guildId) {

            const guildNotFound = new EmbedBuilder()
                .setDescription("Guild not found.")
                .setColor("Blurple");

            await interaction.reply({ embeds: [guildNotFound], flags: MessageFlags.Ephemeral });
            return;

        }

        const userHistoryKey = `servers/${guildId}/${userId}/history`;
        await db.remove(userHistoryKey);

        const userHistoryClearedText = new TextDisplayBuilder()
            .setContent("Your message history has been cleared.")

        const userHistoryCleared = new ContainerBuilder()
            .addTextDisplayComponents(userHistoryClearedText)

        await interaction.reply({ components: [userHistoryCleared], flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral] });

    }

}