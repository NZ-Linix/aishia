import { EmbedBuilder, Client, ChatInputCommandInteraction, PermissionFlagsBits, GuildTextBasedChannel, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags, MediaGalleryBuilder, MediaGalleryItem, MediaGalleryItemBuilder, AttachmentBuilder } from "discord.js";
import * as db from "../handler/database";
import Groq from "groq-sdk";
import * as util from "../util";

const runScript = async (client: Client, interaction: ChatInputCommandInteraction) => {

    const awaitMessage = new ContainerBuilder()
    .addTextDisplayComponents( new TextDisplayBuilder().setContent("Please send your Groq API Key into the chat.\nGet one at https://console.groq.com/home") )
    .addSeparatorComponents( new SeparatorBuilder().setSpacing( SeparatorSpacingSize.Large ) )
    .addMediaGalleryComponents(
        new MediaGalleryBuilder()
        .addItems(

            new MediaGalleryItemBuilder()
            .setURL("https://files.catbox.moe/dpuqab.mov")

        )
    )

    const awaitMessageReply = await interaction.reply({ components: [awaitMessage], flags: MessageFlags.IsComponentsV2 });

    const filter = (m: any) => m.author.id === interaction.user.id;

    const collector = (interaction.channel as GuildTextBasedChannel)?.createMessageCollector({ filter, max: 1 });

    collector?.on("collect", async (message) => {

        await message.delete();

        const apiKey = message.content;

        const apiKeyValidating = new ContainerBuilder()
            .addTextDisplayComponents( new TextDisplayBuilder().setContent(`[❌] Validating API Key...`) )

        await awaitMessageReply.edit({ components: [apiKeyValidating], flags: MessageFlags.IsComponentsV2 });

        const groq = new Groq({ apiKey: apiKey });
        const model = "meta-llama/llama-4-maverick-17b-128e-instruct"

        try {

            const resp = await groq.chat.completions.create({

                messages: [
                    { role: "user", content: "Please just reply with anything." },
                    { role: "system", content: "Please just reply with anything." }
                ],

                model: model,

            });

            const apiKeyValid = new ContainerBuilder()
                .addTextDisplayComponents( new TextDisplayBuilder().setContent(`[✅] API Key is valid!`) )
                .setAccentColor(0x77dd77);

            await awaitMessageReply.edit({ components: [apiKeyValid], flags: MessageFlags.IsComponentsV2 });

            await db.set(`servers/${interaction.guildId}/apiKey`, util.crypt("encrypt", apiKey));

        } catch (error) {

            const apiKeyInvalid = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`[❌] API Key is invalid!`))
                .setAccentColor(0xff6961);

            await awaitMessageReply.edit({ components: [apiKeyInvalid], flags: MessageFlags.IsComponentsV2 });

            return;

        }

    });

};

export default runScript;
