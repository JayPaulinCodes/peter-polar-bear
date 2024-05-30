import { APIActionRowComponent, APIMessageActionRowComponent, ActionRowBuilder, ActionRowComponent, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { BotEmoji } from "..";

export class ComponentHelper {
    
    public static captchaButton(): APIActionRowComponent<APIMessageActionRowComponent> {
        return {
            type: ComponentType.ActionRow,
            components: [
                {
                    type: ComponentType.Button,
                    style: ButtonStyle.Primary,
                    custom_id: "captchaMessage_showCaptcha",
                    label: "Show Captcha Image"
                }
            ]
        }
    }
    
    public static roleShopButtons(): APIActionRowComponent<APIMessageActionRowComponent> {
        return {
            type: ComponentType.ActionRow,
            components: [
                {
                    type: ComponentType.Button,
                    style: ButtonStyle.Primary,
                    custom_id: "roleShopMessage_developmentUpdates",
                    label: "Development Updates",
                    emoji: {
                        name: BotEmoji.BELL
                    }
                },
                {
                    type: ComponentType.Button,
                    style: ButtonStyle.Primary,
                    custom_id: "roleShopMessage_contentUpdates",
                    label: "Content Updates",
                    emoji: {
                        name: BotEmoji.BELL
                    }
                }
            ]
        }
    }
}