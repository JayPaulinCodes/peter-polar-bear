import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildEmoji, ModalBuilder, Role, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { BotEmoji, ChannelName, Colour, Filters, IExandableChannel, IVotingHierarchy, RoleName } from "@bot/constants";
import { ExtendedClient, tryFindEmoji, tryGetRoleByName } from "@bot/core";
import { format } from "node:util";
import { IPhotoChannel } from "./interfaces/IPhotoChannel";

export class Constants {
    public static readonly BlankSpace = "\u200B";

    public static readonly VotingHierarchy: { [key: string]: IVotingHierarchy; } = {
        [ChannelName.ADMIN_VOTING]: {
            nextStep: null,
            rolesToPing: [ RoleName.ADMINISTRATION ]
        },
        [ChannelName.SENIOR_STAFF_VOTING]: {
            nextStep: ChannelName.ADMIN_VOTING,
            rolesToPing: [ RoleName.SENIOR_STAFF ]
        },
        [ChannelName.STAFF_VOTING]: {
            nextStep: ChannelName.SENIOR_STAFF_VOTING,
            rolesToPing: [ RoleName.STAFF ]
        },
        [ChannelName.SIT_VOTING]: {
            nextStep: ChannelName.SENIOR_STAFF_VOTING,
            rolesToPing: [ RoleName.STAFF_IN_TRAINING, RoleName.STAFF ]
        },
        [ChannelName.SUB_VOTING]: {
            nextStep: ChannelName.SENIOR_STAFF_VOTING,
            rolesToPing: [ RoleName.STAFF_IN_TRAINING, RoleName.STAFF ]
        },

        [ChannelName.WSU_SUPERVISORS]: {
            nextStep: null,
            rolesToPing: [ RoleName.WSU_SUPERVISOR ]
        },
        [ChannelName.WSU_TEAM_LEADS]: {
            nextStep: ChannelName.WSU_SUPERVISORS,
            rolesToPing: [ RoleName.WSU_TEAM_LEAD ]
        },

        [ChannelName.TED_SUPERVISORS]: {
            nextStep: null,
            rolesToPing: [ RoleName.TED_SUPERVISOR ]
        },
        [ChannelName.TED_ADVISORS]: {
            nextStep: ChannelName.TED_SUPERVISORS,
            rolesToPing: [ RoleName.TED_ADVISOR ]
        },

        [ChannelName.WLR_SUPERVISORS]: {
            nextStep: null,
            rolesToPing: [ RoleName.WLR_SUPERVISOR ]
        },
        [ChannelName.SENIOR_RANGERS]: {
            nextStep: ChannelName.WLR_SUPERVISORS,
            rolesToPing: [ RoleName.SENIOR_RANGER ]
        },
    }

    public static readonly ExpandableChannels: { [key: string]: IExandableChannel; } = {
        [ChannelName.STAFF_10_1_1]: {
            baseName: ChannelName.STAFF_10_1_1,
            regexSearch: /^(Staff 10-1 #)(?:\d*)$/,
            nonNumberChars: 12
        },

        [ChannelName.PUBLIC_10_1_1]: {
            baseName: ChannelName.PUBLIC_10_1_1,
            regexSearch: /^(10-1 Channel #)(?:\d*)$/,
            nonNumberChars: 14
        },
        
        [ChannelName.RA_1]: {
            baseName: ChannelName.RA_1,
            regexSearch: /^(10-12 #)(?:\d*)$/,
            nonNumberChars: 7
        },
        
        [ChannelName.MEDIA_RA_1]: {
            baseName: ChannelName.MEDIA_RA_1,
            regexSearch: /^(Media 10-12 #)(?:\d*)$/,
            nonNumberChars: 13
        },
        
        [ChannelName.SUB_OPERATIONS_1]: {
            baseName: ChannelName.SUB_OPERATIONS_1,
            regexSearch: /^(Sub Operations #)(?:\d*)$/,
            nonNumberChars: 16
        },

        [ChannelName.FTO_RA_1]: {
            baseName: ChannelName.FTO_RA_1,
            regexSearch: /^(FTO 10-12 #)(?:\d*)$/,
            nonNumberChars: 11
        },
        
        [ChannelName.TRAINING_ROOM_1]: {
            baseName: ChannelName.TRAINING_ROOM_1,
            regexSearch: /^(Training Room #)(?:\d*)$/,
            nonNumberChars: 15
        },
        
        [ChannelName.WSU_RA_1]: {
            baseName: ChannelName.WSU_RA_1,
            regexSearch: /^(WSU 10-12 #)(?:\d*)$/,
            nonNumberChars: 11
        },
        
        [ChannelName.TED_RA_1]: {
            baseName: ChannelName.TED_RA_1,
            regexSearch: /^(TED 10-12 #)(?:\d*)$/,
            nonNumberChars: 11
        },
        
        [ChannelName.WLR_RA_1]: {
            baseName: ChannelName.WLR_RA_1,
            regexSearch: /^(WLR 10-12 #)(?:\d*)$/,
            nonNumberChars: 11
        },
    }

    public static readonly PhotoChannels: { [key: string]: IPhotoChannel; } = {
        [ChannelName.DEPT_PHOTO_CONTEST]: {
            channelName: ChannelName.DEPT_PHOTO_CONTEST,
            messageMustContainImage: true,
            voteEmoji: BotEmoji.STAR,
            voteEmojiIsCustom: false,
            autoReact: true,
            onlyAllowVoteEmoji: true
        },
        [ChannelName.DEPT_PHOTOS]: {
            channelName: ChannelName.DEPT_PHOTOS,
            messageMustContainImage: true
        },
        [ChannelName.CID_PHOTOS]: {
            channelName: ChannelName.CID_PHOTOS,
            messageMustContainImage: true,
            voteEmoji: "cid",
            voteEmojiIsCustom: true,
            autoReact: true,
            onlyAllowVoteEmoji: true
        },
        [ChannelName.TED_PHOTOS]: {
            channelName: ChannelName.TED_PHOTOS,
            messageMustContainImage: true,
            voteEmoji: "ted",
            voteEmojiIsCustom: true,
            autoReact: true,
            onlyAllowVoteEmoji: true
        },
        [ChannelName.WLR_PHOTOS]: {
            channelName: ChannelName.WLR_PHOTOS,
            messageMustContainImage: true,
            voteEmoji: "wlr",
            voteEmojiIsCustom: true,
            autoReact: true,
            onlyAllowVoteEmoji: true
        },
        [ChannelName.WSU_PHOTOS]: {
            channelName: ChannelName.WSU_PHOTOS,
            messageMustContainImage: true,
            voteEmoji: "wsu",
            voteEmojiIsCustom: true,
            autoReact: true,
            onlyAllowVoteEmoji: true
        },
        [ChannelName.CANINE_PHOTOS]: {
            channelName: ChannelName.CANINE_PHOTOS,
            messageMustContainImage: true,
            voteEmoji: "k9",
            voteEmojiIsCustom: true,
            autoReact: true,
            onlyAllowVoteEmoji: true
        },
    }
    
    public static readonly VoteActionMenu = new StringSelectMenuBuilder()
        .setCustomId("vote-action")
        .setPlaceholder("Voting Actions")
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Escalate Vote")
                .setDescription("Escalates the vote to the next step")
                .setValue("vote-action-escalate")
                .setEmoji(BotEmoji.VOTING_ESCALATE),
            new StringSelectMenuOptionBuilder()
                .setLabel("Pass Vote")
                .setDescription("Marks the vote as passed / approved")
                .setValue("vote-action-pass")
                .setEmoji(BotEmoji.VOTING_PASS),
            new StringSelectMenuOptionBuilder()
                .setLabel("Fail Vote")
                .setDescription("Marks the vote as failed / denied")
                .setValue("vote-action-fail")
                .setEmoji(BotEmoji.VOTING_FAIL)
        );
        
    public static readonly RideAlongActions = [
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ride-along-action-join-queue")
                    .setLabel("Join Ride Along Queue")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("ride-along-action-leave-queue")
                    .setLabel("Leave Ride Along Queue")
                    .setStyle(ButtonStyle.Danger)
            ),
        
        new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ride-along-action-fta")
                    .setLabel("FTA Ride Along")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("ride-along-action-fto")
                    .setLabel("FTO Ride Along")
                    .setStyle(ButtonStyle.Primary)
            ),
    ]
        
    public static readonly LoaActions = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setURL("https://docs.google.com/forms/u/0/d/1pT7XApfjgc23yWtTZ6s2LKUWAJiEVoa4JXQQ93n7xeI/viewform?edit_requested=true")
                .setLabel("LOA Form")
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setCustomId("loa-returning")
                .setLabel("Returning From LOA")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("loa-extending")
                .setLabel("Extending LOA")
                .setStyle(ButtonStyle.Primary)
        )

    public static SpecifyFtoRideAlongNumber(id: string) {
        return new ModalBuilder()
            .setCustomId(id)
            .setTitle("Specify Ride Along # Required")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId("rideAlongSpecifyNumber_input")
                            .setMaxLength(1)
                            .setMinLength(1)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                            .setLabel("Which ride along are you requesting?")
                            .setPlaceholder("Enter the number for the ride along you need. (1, 2, 3, 4)")
                    )
            )
    }

    public static AdminMessageInput(id: string): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(id)
            .setTitle("Message Content")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId("adminMessage_input")
                            .setMinLength(1)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                            .setLabel("Enter the content of the message to send")
                    )
            )
    }

    public static EditMessageInput(id: string): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(id)
            .setTitle("Edit Message")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId("adminEditMessage_input")
                            .setMinLength(1)
                            .setMaxLength(2000)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                            .setLabel("Enter the content of the message to update")
                    )
            )
    }
        
    public static readonly RideAlongAcceptanceButtons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("rideAlongAcceptance_confirm")
                .setLabel("Confirm")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("rideAlongAcceptance_cancel")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger)
        )
        
    public static LoaReturningExtendingButtons(emoji?: GuildEmoji | undefined) {
        let button = new ButtonBuilder()
            .setCustomId("loaReturningExtending_staffAcknowledged")
            .setLabel("Acknowledged")
            .setStyle(ButtonStyle.Success);

        if (emoji !== undefined) button = button.setEmoji(emoji.id);

        return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    }

    public static LoaReturning(id: string): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(id)
            .setTitle("Returning From LOA")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId("loaReturning_linkToLoa")
                            .setMinLength(1)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                            .setLabel("LOA post from the DOJRP website")
                    )
            )
    }

    public static LoaExtending(id: string): ModalBuilder {
        return new ModalBuilder()
            .setCustomId(id)
            .setTitle("Extending LOA")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId("loaExtending_linkToLoa")
                            .setMinLength(1)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                            .setLabel("LOA post from the DOJRP website")
                    )
            )
    }

    public static Request1012Buttons(client: ExtendedClient, roles: { role: Role | undefined, emoji: GuildEmoji | undefined }[]): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                roles.map(elem => {
                    if (elem.role === undefined) return null;

                    const button = new ButtonBuilder()
                        .setCustomId(format("raRequestRoleButton-%s", elem.role.name.replace(/ /g, "_")))
                        .setStyle(ButtonStyle.Success);

                    if (elem.emoji === undefined) {
                        return button.setLabel(elem.role.name);
                    } else {
                        return button.setEmoji(elem.emoji.id);
                    }
                }).filter(Filters.notNull)
            )
    }
}