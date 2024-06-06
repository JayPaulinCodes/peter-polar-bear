import { APIEmbed, APIEmbedAuthor, APIEmbedField, APIEmbedFooter, APIEmbedImage, APIEmbedThumbnail, Embed, EmbedType, Role, Snowflake } from "discord.js";
import { Colour, RoleName } from "@bot/constants";
import { ExtendedClient, tryGetRoleByName } from "@bot/core";
import { DbRecommendedCreator } from "@bot/database";

export class BaseEmbed implements APIEmbed {
    type: EmbedType = EmbedType.Rich;
    title?: string = undefined;
    description?: string | undefined = undefined;
    url?: string | undefined = undefined;
    timestamp?: string = Date.now().toString();
    color?: number = Colour.BRANDING;
    footer?: APIEmbedFooter | undefined = undefined;
    image?: APIEmbedImage | undefined = undefined;
    thumbnail?: APIEmbedThumbnail | undefined = undefined;
    author?: APIEmbedAuthor | undefined = undefined;
    fields?: APIEmbedField[] | undefined = undefined;
    
    constructor(data: Omit<APIEmbed, "type" | "provider" | "video"> | undefined) { 
        this.title = data?.title;
        this.description = data?.description;
        this.url = data?.url;
        this.timestamp = data?.timestamp ?? new Date().toISOString();
        this.color = data?.color ?? Colour.BRANDING;
        this.footer = data?.footer;
        this.image = data?.image;
        this.thumbnail = data?.thumbnail;
        this.author = data?.author;
        this.fields = data?.fields;
    }
}

export class ErrorEmbed extends BaseEmbed {
    constructor(message: string, data: Omit<APIEmbed, "type" | "provider" | "video" | "description" | "color"> = {}) {
        super({
            ...data,
            color: Colour.ERROR_RED,
            title: data?.title ?? "**❗ Error**",
            description: message,
        });
    }
}

export class WarningEmbed extends BaseEmbed {
    constructor(message: string, data: Omit<APIEmbed, "type" | "provider" | "video" | "description" | "color"> = {}) {
        super({
            ...data,
            color: Colour.ERROR_RED,
            title: data?.title ?? "**⚠ Warning**",
            description: message,
        });
    }
}

export class SuccessEmbed extends BaseEmbed {
    constructor(message: string, data: Omit<APIEmbed, "type" | "provider" | "video" | "description" | "color"> = {}) {
        super({
            ...data,
            color: Colour.SUCCESS_GREEN,
            title: data?.title ?? "**Action Successful**",
            description: message,
        });
    }
}

export class RolesUpdatedEmbed extends SuccessEmbed {
    constructor(added: Role[], removed: Role[]) {
        super("Successfully completed role updates", {
            fields: [
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
            ]
        });
    }
}

export class CaptchaEmbed extends BaseEmbed {
    constructor() {
        super({
            title: "The Igloo Bouncer",
            description: "To gain access to the Igloo Discord you must first complete a CAPTCHA to verify you are human." 
            + "\n\nYou can view your CAPTCHA by clicking the `Show Captcha` button attached to this message." 
            + "\n\nWhen you are ready to take the CAPTCHA using the `/verify` command."
            + "\n\nIn the event the bot is offline please reach out to a member of the dev team",
        });
    }
}

export class RoleShopEmbed extends BaseEmbed {
    constructor(client: ExtendedClient) {
        const roles: { roleId: string | undefined, description: string }[] = [
            {
                roleId: tryGetRoleByName(client, RoleName.DEV_UPDATES)?.id,
                description: "Get pinged with development updates",
            },
            {
                roleId: tryGetRoleByName(client, RoleName.CONTENT_UPDATES)?.id,
                description: "Get pinged with content creator notifications",
            }
        ].filter(role => role.roleId !== undefined);

        super({
            title: "The Igloo Role Shop",
            description: "You can add and remove roles from youeself using the buttons attached to this embed, you can add and remove the following roles:",
            fields: [
                {
                    name: "Role",
                    value: roles.map(role => `<@&${role.roleId}>`).join("\n"),
                    inline: true
                },
                {
                    name: "Description",
                    value: roles.map(role => role.description).join("\n"),
                    inline: true
                }
            ]
        });
    }
}

export class RecommendedCreatorsEmbed extends BaseEmbed {
    constructor(recommendedCreators: DbRecommendedCreator[]) {
        super({
            title: "The Igloo's Casting Couch",
            description: "Here at the Igloo we like to take care of our own, and we want to make sure you have only the best content to watch, "
            + "which is why we have compiled a list of our recommended content creators!\nWe promise only a *small* protion of them have bribed us.",
            fields: [
                {
                    name: "Creator",
                    value: recommendedCreators.map(creator => `<@${creator.discordId}>`).join("\n"),
                    inline: true
                },
                {
                    name: "Twitch",
                    value: recommendedCreators.map(creator => creator.twitchUrl == null ? "N/A" : `[${creator.twitchUrl}](https://www.twitch.tv/${creator.twitchUrl})`).join("\n"),
                    inline: true
                },
                {
                    name: "Youtube",
                    value: recommendedCreators.map(creator => creator.youtubeUrl == null ? "N/A" : `[${creator.youtubeUrl}](https://www.youtube.com/c/${creator.youtubeUrl})`).join("\n"),
                    inline: true
                }
            ]
        });
    }
}

export class CreatorOnlineTwitchEmbed extends BaseEmbed {
    constructor(handle: string) {
        super({
            description: `${handle} has gone **live** on [Twitch](<https://twitch.tv/${handle}>!)`,
            color: Colour.SUCCESS_GREEN
        });
    }
}