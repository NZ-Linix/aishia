import { EmbedBuilder, Client, ChatInputCommandInteraction, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import * as db from "../handler/database";
import * as util from "../util";

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
        const encryptedHistory = await db.get(userHistoryKey);

        if (!encryptedHistory) {
            const noHistory = new EmbedBuilder()
                .setDescription("No history found.")
                .setColor("Blurple");

            await interaction.reply({ embeds: [noHistory], flags: MessageFlags.Ephemeral });
            return;
        }

        // Decrypt history
        const history = encryptedHistory.map((entry: { role: string; content: string }) => ({
            role: entry.role,
            content: util.crypt("decrypt", entry.content),
        }));

        const itemsPerPage = 6;
        let currentPage = 0;

        const generatePage = (page: number) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = history.slice(start, end);

            const formattedHistory = pageItems.map((entry: { role: string; content: string }) => {
                return `\`\`\`${entry.role === "user" ? "----- User -----" : "---- Aishia ----"}\`\`\`\n${entry.content}`;
            }).join("\n\n");

            const emojiFormattedresp = formattedHistory
                ?.replace(/EMOJI_robin_hsr_hello/g, "<:robin_hsr_hello:1368154538103672904>")
                ?.replace(/EMOJI_robin_hsr_sing/g, "<:robin_hsr_sing:1368154547947569152>")
                ?.replace(/EMOJI_robin_hsr_cute/g, "<:robin_hsr_cute:1368154574841446420>")
                ?.replace(/EMOJI_robin_hsr_peek/g, "<:robin_hsr_peek:1368155494711169054>")
                ?.replace(/EMOJI_kokomi_hsr_cry/g, "<:kokomi_hsr_cry:1368156056835854406>")
                ?.replace(/EMOJI_hilda_fireemblem_smirk/g, "<:hilda_fireemblem_smirk:1368335755230838954>")
                ?.replace(/EMOJI_yoimiya_genshin_oops/g, "<:yoimiya_genshin_oops:1368336057996673094>")
                ?.replace(/EMOJI_kokomi_hsr_clap/g, "<a:kokomi_hsr_clap:1368156167930384445>")
                ?.replace(/EMOJI_kokomi_hsr_kiss/g, "<a:kokomi_hsr_kiss:1368156174981140523>")
                ?.replace(/EMOJI_kokomi_hsr_naughty/g, "<a:kokomi_hsr_naughty:1368156247064576041>")
                ?.replace(/EMOJI_kokomi_hsr_sigh/g, "<a:kokomi_hsr_sigh:1368156261018767360>")
                ?.replace(/EMOJI_kokomi_hsr_flex/g, "<a:kokomi_hsr_flex:1368156270523191407>");

            const embed = new EmbedBuilder()
                .setDescription(emojiFormattedresp || "No more history to display.")
                .setColor("Blurple")
                .setFooter({ text: `Page ${page + 1} of ${Math.ceil(history.length / itemsPerPage)}` });

            return embed;
        };

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("◀️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("▶️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(history.length <= itemsPerPage),
                new ButtonBuilder()
                    .setCustomId("exit")
                    .setLabel("❌")
                    .setStyle(ButtonStyle.Danger)
            );

        const message = await interaction.reply({
            embeds: [generatePage(currentPage)],
            components: [row],
            flags: 64
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
        });

        collector.on("collect", async (btnInteraction) => {
            if (btnInteraction.user.id !== userId) {
                await btnInteraction.reply({ embeds: [new EmbedBuilder().setDescription("Please use `/user actions view-history` to get your own embeds.").setColor("Blurple")], flags: 64 });
                return;
            }

            if (btnInteraction.customId === "prev") {
                currentPage = Math.max(currentPage - 1, 0);
            } else if (btnInteraction.customId === "next") {
                currentPage = Math.min(currentPage + 1, Math.ceil(history.length / itemsPerPage) - 1);
            } else if (btnInteraction.customId === "exit") {
                await message.delete();
                collector.stop();
                return;
            }

            await btnInteraction.update({
                embeds: [generatePage(currentPage)],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("prev")
                                .setLabel("◀️")
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentPage === 0),
                            new ButtonBuilder()
                                .setCustomId("next")
                                .setLabel("▶️")
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentPage === Math.ceil(history.length / itemsPerPage) - 1),
                            new ButtonBuilder()
                                .setCustomId("exit")
                                .setLabel("❌")
                                .setStyle(ButtonStyle.Danger)
                        )
                ]
            });
        });
    }
};