import { ChatInputCommandInteraction, Client, ContainerBuilder, Events, Message, MessageFlags, TextDisplayBuilder } from "discord.js";
import * as db from "./handler/database";
import Groq from "groq-sdk";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

import "dotenv/config";

import research from "./util_tools/research";
import { readFileSync } from "fs";
import { join } from "path";

const EMOJIS_LIST = readFileSync(join("emojis.txt"), "utf-8");
const SYSTEM_PROMPT_TEMPLATE = readFileSync(join("systemprompt.txt"), "utf-8");

async function generateSystemInstructions(message: Message, client: Client) {

    const currentTime = new Date();
    const day = String(currentTime.getDate()).padStart(2, '0');
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const year = currentTime.getFullYear();
    const hour = String(currentTime.getHours()).padStart(2, '0');
    const minute = String(currentTime.getMinutes()).padStart(2, '0');
    const second = String(currentTime.getSeconds()).padStart(2, '0');
    const timeString = `Day: ${day}, Month: ${month}, Year: ${year} | Hour: ${hour}, Minute: ${minute}, Second: ${second}`;

    const emojis = EMOJIS_LIST;

    const userInfo = `\nHere is some information about the user:\nUsername: ${message.author.username}\nDisplayname: ${message.member?.displayName ?? message.author.displayName}\n`;

    const template = SYSTEM_PROMPT_TEMPLATE;

    const systemInstructions = template
        .replace("{userInfo}", userInfo)
        .replace("{emojis}", emojis)
        .replace("{timeString}", timeString);

    return systemInstructions;
}

async function stringInput(client: Client, interaction: ChatInputCommandInteraction, prompt: string, deleteOptions?: { deleteUser?: boolean, deleteBot?: boolean }, customMessage?: Message) {

    if ( !interaction.channel?.isSendable() || !interaction.channel?.isTextBased() ) {

        const errorText = new TextDisplayBuilder()
        .setContent("This command can only be used in text channels.")

        const errorContainer = new ContainerBuilder()
        .addTextDisplayComponents( errorText )

        await interaction.reply({
            components: [errorContainer],
            flags: [ MessageFlags.IsComponentsV2 ]
        });

        return 1;

    }

    const promptTextWaiting = new TextDisplayBuilder()
    .setContent(prompt);

    const promptTextFinished = new TextDisplayBuilder()
    .setContent(prompt);

    const promptContainer = new ContainerBuilder()
    .addTextDisplayComponents( promptTextWaiting );

    const promptContainerSuccess = new ContainerBuilder()
    .addTextDisplayComponents( promptTextFinished )
    .setAccentColor(0x91cc89)

    let promptMessage: Message;

    if ( !customMessage ) {

        promptMessage = await interaction.channel.send({
            components: [promptContainer],
            flags: [ MessageFlags.IsComponentsV2 ],
        });

    }

    await db.set("input/await/" + interaction.user.id + "/string", true);

    const responsePromise = new Promise<Message>((resolve) => {

        client.on(Events.MessageCreate, async (message) => {

            if ( message.author.id !== interaction.user.id ) return;
            if ( !db.get("input/await/" + interaction.user.id + "/string") ) return;

            await db.remove("input/await/" + interaction.user.id + "/string");

            if ( deleteOptions?.deleteUser ) {

                await message.delete().catch(() => {});

            }

            if ( deleteOptions?.deleteBot ) {

                if ( customMessage ) {

                    await customMessage.delete().catch(() => {});

                } else {

                    await promptMessage.delete().catch(() => {});

                }

            } else {

                if (  customMessage ) {



                } else {

                    await promptMessage.edit({ components: [ promptContainerSuccess ] });

                }

            }

            const response = message
            resolve(response as Message);

        });

    })

    const response: Message = await responsePromise;

    if ( response.attachments.size > 0 ) {

        const attachment_urls = response.attachments.map(attachment => attachment.url);

        return attachment_urls;

    }

    return response;
    
}

async function getTools() {

    return [

        {

            type: "function",
            "function": {

                "name": "research",
                "description": "Research the internet for information. Use when you are unsure about something or need to find information.",

                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The query to search for on the internet."
                        }
                    },

                "required": ["query"]

                }
            
            }

        }

    ]

}

async function getEmoji(emoji: string) {

    switch (emoji) {

        case "aishia_coin":
            return "<:aishia_coin:1386061889385267323>";

    }
    
}

async function toolHandler(resp, toolName, toolArgs, message: Message) {
    
    const toolFunctions = {

        research: research
        
    }

    if ( toolFunctions[toolName] ) {

        return await toolFunctions[toolName](toolArgs, message);

    } else {

        return JSON.stringify({ error: "Unknown Tool: " + toolName });
    
    }

}

function crypt(method: "encrypt" | "decrypt", text: string) {

    if ( method !== "encrypt" && method !== "decrypt" ) {
        throw new Error("Invalid method. Use 'encrypt' or 'decrypt'.");
    }

    const algorithm = "aes-256-cbc";

    if (!process.env.ENCRYPTION_KEY) {
        throw new Error("ENCRYPTION_KEY environment variable is not defined.");
    }

    const key = Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32, '\0').slice(0, 32), "utf-8");

    if (method === "encrypt") {
        const iv = randomBytes(16);
        const cipher = createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(text, "utf-8", "hex");
        encrypted += cipher.final("hex");
        
        return iv.toString("hex") + ":" + encrypted;
    } else {
        const parts = text.split(":");

        const ivHex = parts.shift();
        if (!ivHex || ivHex.length !== 32) {
            throw new Error("Invalid or missing IV in encrypted text.");
        }

        const iv = Buffer.from(ivHex, "hex");
        if (iv.length !== 16) {
            throw new Error("IV must be 16 bytes long.");
        }

        const encryptedText = parts.join(":");
        const decipher = createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
        return decrypted;
    }

}

export { generateSystemInstructions, stringInput, getEmoji, getTools, toolHandler, crypt };
