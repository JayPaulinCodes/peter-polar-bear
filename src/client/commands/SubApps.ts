import { SlashCommandBuilder } from "discord.js";
import { format } from "node:util";
import { Command, generalLog } from "@bot/core";
import { RoleName } from "@bot/constants";
import { DbLogic } from "@bot/database";

export default new Command({
    data: new SlashCommandBuilder()
        .setName("subapps")
        .setDescription("Update the status of a subdivision's applications")
        .addSubcommand(subCmd => subCmd
            .setName("wsu")
            .setDescription("Update the status of WSU applications")
            .addStringOption(options => options
                .setName("status")
                .setDescription("The new status for applications")
                .setRequired(true)
                .addChoices(
                    { name: "Open", value: "open" },
                    { name: "Closed", value: "closed" }
                )))
        .addSubcommand(subCmd => subCmd
            .setName("cid")
            .setDescription("Update the status of CID applications")
            .addStringOption(options => options
                .setName("status")
                .setDescription("The new status for applications")
                .setRequired(true)
                .addChoices(
                    { name: "Open", value: "open" },
                    { name: "Closed", value: "closed" }
                )))
        .addSubcommand(subCmd => subCmd
            .setName("wlr")
            .setDescription("Update the status of WLR applications")
            .addStringOption(options => options
                .setName("status")
                .setDescription("The new status for applications")
                .setRequired(true)
                .addChoices(
                    { name: "Open", value: "open" },
                    { name: "Closed", value: "closed" }
                )))
        .addSubcommand(subCmd => subCmd
            .setName("ted")
            .setDescription("Update the status of TED applications")
            .addStringOption(options => options
                .setName("status")
                .setDescription("The new status for applications")
                .setRequired(true)
                .addChoices(
                    { name: "Open", value: "open" },
                    { name: "Closed", value: "closed" }
                )))
        .addSubcommand(subCmd => subCmd
            .setName("k9")
            .setDescription("Update the status of K9 applications")
            .addStringOption(options => options
                .setName("status")
                .setDescription("The new status for applications")
                .setRequired(true)
                .addChoices(
                    { name: "Open", value: "open" },
                    { name: "Closed", value: "closed" }
                )))
        .setDMPermission(false),
    run: async ({ client, interaction }) => {
        if (interaction.options.data[0].options === undefined) return;
        if (interaction.guild === null) return;
        await interaction.deferReply({ ephemeral: true });
        const subdivision = interaction.options.data[0].name;
        const newStatus = interaction.options.data[0].options[0].value;
        if (newStatus === undefined) return;
        const guild = interaction.guild;
        const user = await guild.members.fetch(interaction.user.id);

        const process = async (
            roleCheck: { admin: boolean, seniorStaff: boolean, coordinator: boolean, supervisor: boolean },
            subdivision: string,
            newStatus: string) => {
                // Permission check
                if (!roleCheck.admin && !roleCheck.seniorStaff && !roleCheck.coordinator && !roleCheck.supervisor) {
                    await interaction.followUp({
                        embeds: [ client.embeds.warnning("You lack the required roles to execute this command, it can only be used by Subdivision CoC or BCSO Senior Staff+") ]
                    });
                    return;
                }

                // Fetch info from DB
                const dbInfo = await DbLogic.getSubdivisionInfoByAbbr(subdivision.toUpperCase());
                if (dbInfo === null) {
                    await interaction.followUp({
                        embeds: [ client.embeds.error("An error occured while trying to update the application status!\nThis error was reported to DepuTRON Team, but if it keeps occuring please reach out to a member on DepuTRON Team.") ]
                    });
                    return;
                }

                // Update DB info
                if ((newStatus.toUpperCase() === "OPEN" && dbInfo.applicationsOpen) 
                    || (newStatus.toUpperCase() === "CLOSED" && !dbInfo.applicationsOpen)) {
                    await interaction.followUp({
                        embeds: [ client.embeds.warnning(format("%s applications are already %s", subdivision.toUpperCase(), newStatus.toLowerCase())) ]
                    });
                    return;
                }
                dbInfo.applicationsOpen = newStatus.toUpperCase() === "OPEN";
                await DbLogic.updateSubdivisionInfo(dbInfo);

                // Refresh static message
                client.staticMessages.get("importantLinks")?.update(client);

                // Send success embed
                await interaction.followUp({
                    embeds: [ client.embeds.success(format("Successfully updated the status of %s applications to '%s'", subdivision.toUpperCase(), newStatus.toUpperCase())) ]
                });

                // Create log
                await generalLog(client, format(
                    "%s (%s) updated the status of %s applications to '%s'",
                    user.nickname,
                    user.id,
                    subdivision.toUpperCase(),
                    newStatus.toUpperCase()));
                
                return;
            }

        
        const hasAdmin = user.roles.cache.some(role => role.name === RoleName.ADMINISTRATION);
        const hasSeniorStaff = user.roles.cache.some(role => role.name === RoleName.SENIOR_STAFF);
        switch (subdivision) {
            case "wsu":
                await process({
                    admin: hasAdmin,
                    seniorStaff: hasSeniorStaff,
                    coordinator: user.roles.cache.some(role => role.name === RoleName.WSU_COORDINATOR),
                    supervisor: user.roles.cache.some(role => role.name === RoleName.WSU_SUPERVISOR)
                }, subdivision, newStatus.toString());
                break;
            case "cid":
                await process({
                    admin: hasAdmin,
                    seniorStaff: hasSeniorStaff,
                    coordinator: user.roles.cache.some(role => role.name === RoleName.CID_COORDINAOR),
                    supervisor: user.roles.cache.some(role => role.name === RoleName.CID_SUPERVISOR)
                }, subdivision, newStatus.toString());
                break;
            case "ted":
                await process({
                    admin: hasAdmin,
                    seniorStaff: hasSeniorStaff,
                    coordinator: user.roles.cache.some(role => role.name === RoleName.TED_COORDINATOR),
                    supervisor: user.roles.cache.some(role => role.name === RoleName.TED_SUPERVISOR)
                }, subdivision, newStatus.toString());
                break;
            case "wlr":
                await process({
                    admin: hasAdmin,
                    seniorStaff: hasSeniorStaff,
                    coordinator: user.roles.cache.some(role => role.name === RoleName.WLR_COORDINATOR),
                    supervisor: user.roles.cache.some(role => role.name === RoleName.WLR_SUPERVISOR)
                }, subdivision, newStatus.toString());
                break;
            case "k9":
                await process({
                    admin: hasAdmin,
                    seniorStaff: hasSeniorStaff,
                    coordinator: user.roles.cache.some(role => role.name === RoleName.K9_COORDINATOR),
                    supervisor: user.roles.cache.some(role => role.name === RoleName.K9_SUPERVISOR)
                }, subdivision, newStatus.toString());
                break;
        }
    }
});

