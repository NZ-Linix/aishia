import { EmbedBuilder, Client, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import * as db from "../handler/database";
import * as util from "../util";

export default {

    runScript: async (client: Client, interaction: ChatInputCommandInteraction) => {

        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        const userHistoryKey = `servers/${guildId}/${userId}/history`;
        const historyName = interaction.options.getString("name");
        const confirm = interaction.options.getBoolean("confirm");

        if (!confirm) {
            const confirmEmbed = new EmbedBuilder()
                .setDescription("Please confirm the action by using the `confirm` option.")
                .setColor("Blurple");
            await interaction.reply({ embeds: [confirmEmbed], flags: 64 });
            return;
        }

        if (!historyName) {
            const missingNameEmbed = new EmbedBuilder()
                .setDescription("Please enter the name of the history to load.")
                .setColor("Blurple");
            await interaction.reply({ embeds: [missingNameEmbed], flags: 64 });
            return;
        }

        const historyKey = `servers/${guildId}/${userId}/history_storage/${historyName}`;

        let history = await db.get(historyKey);

        if (!history) {
            const notFoundEmbed = new EmbedBuilder()
                .setDescription("No chat history found with this name.")
                .setColor("Blurple");
            await interaction.reply({ embeds: [notFoundEmbed], flags: 64 });
            return;
        }

        // Decrypt history before loading
        for (let i = 0; i < history.length; i++) {
            if (history[i].content) {
                history[i].content = await util.crypt("decrypt", history[i].content);
            }
        }

        await db.set(userHistoryKey, history);

        const successEmbed = new EmbedBuilder()
            .setDescription("Chat history loaded successfully.")
            .setColor("Blurple");

        await interaction.reply({ embeds: [successEmbed], flags: 64 });

    }

}