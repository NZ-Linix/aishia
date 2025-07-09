import Groq from "groq-sdk"
import * as db from "../handler/database";
import { Message, ContainerBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";
import * as util from "../util"

export default async (toolArgs: {query: string}, message: Message) => {

    if ( !message.channel.isSendable() || message.channel.isDMBased() || !message.channel.isTextBased ) {

        return JSON.stringify({ error: "This tool cannot be run in a non-text channel." })

    }

    const mainApiKey = await util.crypt("decrypt", await db.get(`servers/${message.guildId}/apiKey`));

    if ( !mainApiKey ) { return JSON.stringify({ error: "AISHIA is not setup. Please ask an admin to setup the bot." }); }

    const startingResearchProcess = new ContainerBuilder().addTextDisplayComponents( new TextDisplayBuilder().setContent("Starting research process..."));
    const startingResearchProcessMessage = await message.channel.send({ components: [startingResearchProcess], flags: MessageFlags.IsComponentsV2 });

    const groq = new Groq({ apiKey: mainApiKey });

    const query = toolArgs.query;

    const messages = [
        {
            role: "system",
            content: "You are a research assistant. Your task is to help the user find information on the topic / query they provide. You will use the query provided to search for relevant information (across the web) and return it in a concise manner. Please do not use markdown."
        },
        {
            role: "user",
            content: query,
        }
    ]

    const chatCompletionOptions: any = {
        messages,
        model: "compound-beta",
    };

    const resp = await groq.chat.completions.create(chatCompletionOptions);

    const respText = resp.choices[0].message.content;

    await startingResearchProcessMessage.delete().catch(() => {});

    if ( !respText || respText.length === 0 ) {

        return JSON.stringify({ error: "No results found." });

    }

    return JSON.stringify({ response: respText });

}
