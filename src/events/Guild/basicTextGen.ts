import { Events, Message, Client, GuildTextBasedChannel, EmbedBuilder, ChannelType, Embed, ContainerBuilder, TextDisplayBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import Groq from "groq-sdk";
import * as db from "../../handler/database";
import emojiRegex from "emoji-regex"
import "dotenv/config";

import * as util from "../../util";

/* ------------------------------ Configuration ----------------------------- */

let model: string = process.env.GROQ_MODEL || "";
let temp = 0.8;
const historyLimit = parseInt(process.env.HISTORY_LIMIT || "100") || 100;

export default {

    data: {
        event: Events.MessageCreate,
        once: false,
    },

    async execute(client: Client, message: Message) {

        /* ----------------------------- Checking Mention --------------------------- */

        if ( message.author.bot ) { return; }
        if ( !client.user ) { return; }
        if ( !message.mentions.has(client.user) ) { return; }

        /* ------------------------- Checking guild and user ------------------------ */

        if ( !message.guild ) { return; }
        if ( !message.member ) { return; }
        if ( !message.author ) { return; }
        if ( message.channel.type !== ChannelType.GuildText ) { return; }

        /* ------------------------------- Get API Key ------------------------------ */

        let mainApiKey;
        try {
            const encryptedApiKey = await db.get(`servers/${message.guildId}/apiKey`);
            mainApiKey = await util.crypt("decrypt", encryptedApiKey);
        } catch (error) {
            mainApiKey = null;
        }

        if ( mainApiKey === null || mainApiKey === "" ) {

            const notSetupContainer = new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent("AISHIA is not setup.\nUse the command `/server settings set-apikey`.")
            );
            await message.channel.send({ components: [notSetupContainer], flags: MessageFlags.IsComponentsV2 });
            return;

        }

        /* -------------------------- Setup the Groq client ------------------------- */

        const groq = new Groq({ apiKey: mainApiKey });

        /* ---------------------- Get message content / prompt ---------------------- */

        const userMessageContent = await message.content.replace(`<@${client.user?.id}>`, "").trim();
        if ( !userMessageContent ) { return; }

        const systemInstructions = await util.generateSystemInstructions(message, client)

        /* ----------------------------- Handling memory ---------------------------- */


        const userHistoryKey = `servers/${message.guildId}/${message.author.id}/history`;
        const userHistory: Array<any> = (await db.get(userHistoryKey)) || [];

        const decryptedUserHistory: Array<any> = [];
        for (let i = 0; i < userHistory.length; i++) {
            if (userHistory[i].content) {
                decryptedUserHistory.push({
                    ...userHistory[i],
                    content: await util.crypt("decrypt", userHistory[i].content)
                });
            } else {
                decryptedUserHistory.push({ ...userHistory[i] });
            }
        }

        if ( historyLimit !== 0 ) {
            while (userHistory.length > historyLimit) {
                userHistory.shift();
            }
        }

        const tools = await util.getTools();

        /* ------------------------ Generate the user message ----------------------- */

        let userMessage;

        if ( message.attachments.size > 0 ) {

            userMessage = {
                role: "user",
                content: 
                [ 
                    { type: "text", text: userMessageContent },
                    { type: "image_url", image_url: { url: message.attachments.first()?.url } } 
                ] 
            };

        } else {

            userMessage = {
                role: "user",
                content: 
                [
                    { type: "text", text: userMessageContent }
                ]
            }

        }

        /* ---------------------- Generate prompt to send to AI --------------------- */

        const messages = 
        [
            { role: "system", content: systemInstructions },
            ...decryptedUserHistory,
            userMessage,
        ]

        /* -------------------------- Generate AI response -------------------------- */

        await message.channel.sendTyping();

        let resp;

        try {

            const chatCompletionOptions: any = {
                messages,
                temperature: temp,
                model: model,
            };

            if (tools && tools.length > 0) {
                chatCompletionOptions.tools = tools;
                chatCompletionOptions.tool_choice = "auto";
            }

            resp = await groq.chat.completions.create(chatCompletionOptions);

            if ( resp && resp.choices[0].message.tool_calls ) {

                messages.push({
                    role: "assistant",
                    content: resp.choices[0].message.content,
                    tool_calls: resp.choices[0].tool_calls
                });

                for ( const toolCall of resp.choices[0].message.tool_calls ) {

                    const toolId = toolCall.id
                    const toolName = toolCall.function.name
                    const toolArgs = JSON.parse(toolCall.function.arguments);
                    
                    const toolResponse = await util.toolHandler(resp, toolName, toolArgs, message);

                    messages.push({
                        tool_call_id: toolId,
                        role: "tool",
                        content: toolResponse,
                    });

                }

                resp = await groq.chat.completions.create({
                    messages,
                    temperature: temp,
                    model: model,
                });

            }

        } catch ( error ) {

            console.log(error);

            const errorGeneratingResponse = new ContainerBuilder()
            .addTextDisplayComponents( new TextDisplayBuilder().setContent("Uh oh! <a:kokomi_hsr_sigh:1368156261018767360> There was an error while generating the response.") )
            await message.channel.send({ components: [ errorGeneratingResponse ], flags: MessageFlags.IsComponentsV2 });
            return;

        }

        /* ---------------------- Formatting emojis in response --------------------- */

        const emojiRegexPattern = emojiRegex();

        let finalResult = resp?.choices?.[0]?.message?.content
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
            ?.replace(/EMOJI_kokomi_hsr_flex/g, "<a:kokomi_hsr_flex:1368156270523191407>")
            ?.replace(/EMOJI_aqua_konosuba_cry/g, "<:aqua_konosuba_cry:1375846539662065765>")
            ?.replace(/EMOJI_castorice_hsr_blush/g, "<:castorice_hsr_blush:1375846551280287774>")
            ?.replace(/EMOJI_castorice_hsr_weird/g, "<:castorice_hsr_weird:1375846558985224214>")
            ?.replace(/EMOJI_elysia_smirk/g, "<:elysia_smirk:1375846567629688902>")
            ?.replace(/EMOJI_girl_boring/g, "<:girl_boring:1375846577511600189>")
            ?.replace(/EMOJI_tsukasa_tonikawa_unimpressed/g, "<:tsukasa_tonikawa_unimpressed:1375846585421926510>")
            ?.replace(/EMOJI_kokomi_hsr_cute/g, "<:kokomi_hsr_cute:1376094463654629468>")
            ?.replace(emojiRegexPattern, "");

        /* ---------------------------- Handling response --------------------------- */

        const textDisplay_Response = new TextDisplayBuilder()

        try {
            textDisplay_Response.setContent(finalResult || "Uh oh! <a:kokomi_hsr_sigh:1368156261018767360> There was an error while generating the response.")
        } catch (error) {
            const tooLongContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("The response was too long to display <a:kokomi_hsr_sigh:1368156261018767360>")
                );
            await message.channel.send({ components: [tooLongContainer], flags: MessageFlags.IsComponentsV2 });
            return;
        }
        
        const container_Response = new ContainerBuilder()
        .addTextDisplayComponents(textDisplay_Response)

        await message.channel.send({ components: [ container_Response ], flags: MessageFlags.IsComponentsV2 })

        /* ----------------------------- Updating memory ---------------------------- */


        const assistantContent = util.crypt("encrypt", resp?.choices?.[0]?.message?.content);

        if (userMessageContent && assistantContent) {
            userHistory.push({ role: "user", content: util.crypt("encrypt", userMessageContent) });
            userHistory.push({ role: "assistant", content: assistantContent });
            await db.set(userHistoryKey, userHistory);
        }

    }

}