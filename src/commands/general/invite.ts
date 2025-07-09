//_SLASH_COMMAND

import { SlashCommandBuilder, EmbedBuilder, Client, ChatInputCommandInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType, Embed } from "discord.js";

export default {

    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite AISHIA to your server"),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        const inviteLink = "https://discord.com/oauth2/authorize?client_id=1367901020939882718&permissions=1689934876900416&integration_type=0&scope=bot"
        const altInviteLink = "https://discord.com/oauth2/authorize?client_id=1367901020939882718&permissions=8&integration_type=0&scope=bot"

        const inviteEmbed = new EmbedBuilder()
        .setDescription("**Invite AISHIA to your server**\n\n" +
                        "You can invite AISHIA to your server by clicking the button below.\n" +
                        "If you have any questions or issues, feel free to join our support server.\n" + 
                        "If you have issues with the first link, use the second one.")
        .setColor("Blurple")

        const inviteButton = new ButtonBuilder()
        .setLabel("Invite AISHIA")
        .setURL(inviteLink)
        .setStyle(ButtonStyle.Link)
        .setEmoji("🔗")
        .setDisabled(false)

        const secondInviteButton = new ButtonBuilder()
        .setLabel("Invite AISHIA (Alternative)")
        .setURL(altInviteLink)
        .setStyle(ButtonStyle.Link)
        .setEmoji("🔗")
        .setDisabled(false)

        const inviteRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(inviteButton, secondInviteButton)

        await interaction.reply({ embeds: [inviteEmbed], components: [inviteRow] });

    }

}