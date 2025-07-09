import { EmbedBuilder, Client, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import * as db from "../handler/database";

export default {

    runScript: async (client: Client, interaction: ChatInputCommandInteraction) => {

        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        const historyName = interaction.options.getString("name");

        if (!historyName) {
            const nameNotFound = new EmbedBuilder()
                .setDescription("Please enter the name of the history to delete.")
                .setColor("Blurple");

            await interaction.reply({ embeds: [nameNotFound], flags: 64 });
            return;
        }

        const historyKey = `servers/${guildId}/${userId}/history_storage/${historyName}`;

        const history = await db.get(historyKey);

        if (!history) {
            const noHistoryFound = new EmbedBuilder()
                .setDescription("No chat history found with this name.")
                .setColor("Blurple");

            await interaction.reply({ embeds: [noHistoryFound], flags: 64 });
            return;
        }

        await db.remove(historyKey);

        const deleted = new EmbedBuilder()
            .setDescription("Chat history deleted successfully.")
            .setColor("Blurple");

        await interaction.reply({ embeds: [deleted], flags: 64 });

    }

}