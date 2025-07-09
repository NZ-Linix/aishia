import { EmbedBuilder, Client, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import * as db from "../handler/database";
import * as util from "../util";

export default {

    runScript: async (client: Client, interaction: ChatInputCommandInteraction) => {

        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        const userHistoryKey = `servers/${guildId}/${userId}/history`;
        const currentChat = await db.get(userHistoryKey);

        if (!currentChat) {
            const noHistoryEmbed = new EmbedBuilder()
                .setDescription("No chat history found to save.")
                .setColor("Blurple");

            await interaction.reply({ embeds: [noHistoryEmbed], flags: 64 });
            return;
        }

        for (let i = 0; i < currentChat.length; i++) {
            if (currentChat[i].content) {
                currentChat[i].content = await util.crypt("decrypt", currentChat[i].content);
            }
        }

        const name = interaction.options.getString("name");

        if (!name) {
            const noNameEmbed = new EmbedBuilder()
                .setDescription("Please provide a name for the chat history.")
                .setColor("Blurple");

            await interaction.reply({ embeds: [noNameEmbed], flags: 64 });
            return;
        }

        const historyKey = `servers/${guildId}/${userId}/history_storage/${name}`;

        const existingHistory = await db.get(historyKey);

        if (existingHistory) {
            const duplicateNameEmbed = new EmbedBuilder()
                .setDescription("A chat history with this name already exists. Please choose a different name.")
                .setColor("Blurple");

            await interaction.reply({ embeds: [duplicateNameEmbed], flags: 64 });
            return;
        }

        const encryptedChat = currentChat.map(entry => ({
            ...entry,
            content: entry.content ? util.crypt("encrypt", entry.content) : entry.content
        }));

        await db.set(historyKey, encryptedChat);

        const savedEmbed = new EmbedBuilder()
            .setDescription("Chat history saved successfully.")
            .setColor("Blurple");

        await interaction.reply({ embeds: [savedEmbed], flags: 64 });

        return;

    }

}