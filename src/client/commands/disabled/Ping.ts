import { SlashCommandBuilder } from "discord.js";
import { Command } from "@bot/core";

export default new Command({
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")
        .setDMPermission(false),
    run: async ({ interaction }) => {
        throw new SyntaxError("Invalid Syntaxt Test")
        // await interaction.reply({
        //     ephemeral: true,
        //     content: "Pong"
        // });
    }
});

