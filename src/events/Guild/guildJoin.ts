import { Client, Events, Guild, ContainerBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";

export default {

    data: {

        event: Events.GuildCreate,
        once: false,

    },

    async execute( client: Client, guild: Guild ) {

        try {
            const owner = guild?.ownerId;
            const ownerUser = await client.users.fetch(owner || "");

            if (!ownerUser) {
            console.log("Owner user not found.");
            return;
            }

            const welcomeContainer = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                "# Welcome to AISHIA!\nThank you for adding AISHIA to your server!\n" +
                "I've decided to send this message to the server owner to keep your server clean.\n\n" +
                "You can get started by using the `/server settings set-apikey` command.\n" +
                "-# You can DM any bugs or suggestions to linix_red or aishia_dev.\n"
            ));

            await ownerUser.send({ components: [welcomeContainer], flags: MessageFlags.IsComponentsV2 });
        } catch (error) {
            console.error("An error occurred while sending the welcome message:", error);
        }

    }

}