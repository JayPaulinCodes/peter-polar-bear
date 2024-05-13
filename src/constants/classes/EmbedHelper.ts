import { Attachment, AttachmentBuilder, EmbedBuilder, EmbedFooterData, Guild, GuildEmoji, GuildMember, Role } from "discord.js";
import { ExtendedClient } from "@bot/core";
import { format } from "util";
import { Colour, Constants, Filters, RoleName } from "@bot/constants";

export class EmbedHelper {
    private readonly client: ExtendedClient;

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    public base(addTimestamp: boolean = true): EmbedBuilder {
        let embed = new EmbedBuilder()
            .setColor(Colour.BRANDING)
            .setFooter({
                text: "Munching on a hot dog around the campfire"
            });

        if (addTimestamp) embed = embed.setTimestamp();

        return embed;
    }

    public error(message: string): EmbedBuilder {
        return this.base()
            .setColor(Colour.ERROR_RED)
            .setTitle("**❗ Error**")
            .setDescription(message);
    }

    public warnning(message: string): EmbedBuilder {
        return this.base()
            .setColor(Colour.WARNING_YELLOW)
            .setTitle("**⚠ Warning**")
            .setDescription(message);
    }

    public success(message: string): EmbedBuilder {
        return this.base()
            .setColor(Colour.SUCCESS_GREEN)
            .setDescription(format("✅ %s", message));
    }

    public captchaVerify(): EmbedBuilder {
        return this.base()
            .setTitle("The Igloo Bouncer")
            .setDescription("To gain access to the Igloo Discord you must first complete a CAPTCHA to verify you are human." 
            + "\n\nYou can view your CAPTCHA by clicking the `Show Captcha` button attached to this message." 
            + "\n\nWhen you are ready to take the CAPTCHA using the `/verify` command."
            + "\n\nIn the event the bot is offline please reach out to a member of the dev team");
    }

    public roleUpdates(added: Role[], removed: Role[]): EmbedBuilder {
        return this.success("Successfully completed role updates")
            .setFields(
                {
                    name: "Roles Added",
                    value: added.length === 0 ? "N/A" : added.map(elem => elem.toString()).join("\n"),
                    inline: true
                },
                {
                    name: "Roles Removed",
                    value: removed.length === 0 ? "N/A" : removed.map(elem => elem.toString()).join("\n"),
                    inline: true
                }
            );
    }
}