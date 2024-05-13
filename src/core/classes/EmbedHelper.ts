import { Attachment, AttachmentBuilder, EmbedBuilder, EmbedFooterData, Guild, GuildEmoji, GuildMember, Role } from "discord.js";
import { ExtendedClient } from "./ExtendedClient";
import { format } from "util";
import { Colour, Constants, Filters, RoleName } from "@bot/constants";
import { DbLogic, DbFtoRideAlong } from "@bot/database";
import { toUnixTime, tryGetRoleByName } from "@bot/core";

export class EmbedHelper {
    private readonly client: ExtendedClient;

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    public base(addTimestamp: boolean = true): EmbedBuilder {
        let embed = new EmbedBuilder()
            .setColor(Colour.DEPUTRON_ORANGE)
            .setFooter({
                text: "Watching for speeders from a bush"
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

    public importantLinksBcso(): [ EmbedBuilder, AttachmentBuilder ] {
        const attachment = new AttachmentBuilder("./assets/bcsoLogo.png");
        const links = [
            {
                section: "DoJRP Links",
                links: [
                    [ "Community Rules & Regulations", "https://google.ca/" ],
                    [ "DoJ Legal Code", "https://google.ca/" ],
                    [ "Official DoJRP Discord", "https://google.ca/" ],
                    [ "Declaration of Intention to Double Clan", "https://google.ca/" ],
                    [ "Internal Affairs Complaint Form", "https://google.ca/" ],
                    [ "DoJRP 10 Codes", "https://google.ca/" ],
                    [ "FTO Suggestion Form", "https://google.ca/" ],
                    [ "LEO Training Guide", "https://google.ca/" ],
                ]
            },
            {
                section: "Miscellaneous Documents",
                links: [
                    [ "Self Dispatch Policy", "https://google.ca/" ],
                    [ "LEO Self Transport Policy", "https://google.ca/" ],
                    [ "LEO/Dispatch SOP for Public Works", "https://google.ca/" ],
                    [ "LEO First Responder Guide", "https://google.ca/" ],
                    [ "LEO Union Identifier Policy", "https://google.ca/" ],
                    [ "Off-Roading Policy", "https://google.ca/" ],
                    [ "FTO Community Policies", "https://google.ca/" ],
                ]
            },
            {
                section: "BCSO Documents",
                links: [
                    [ "BCSO Portal", "https://google.ca/" ],
                    [ "Welcome Letter", "https://google.ca/" ],
                    [ "Department SOP", "https://google.ca/" ],
                    [ "Department Policies", "https://google.ca/" ],
                    [ "Public Roster", "https://google.ca/" ],
                    [ "Vehicle Structure", "https://google.ca/" ],
                    [ "Uniform Structure", "https://google.ca/" ],
                    [ "Patrol Log", "https://google.ca/" ],
                    [ "Suggestion/Feedback Form (BCSO Suggestions Only)", "https://google.ca/" ],
                    [ "Frequently Asked Questions", "https://google.ca/" ],
                    [ "BCSO Commend & Complaint Form", "https://google.ca/" ],
                    [ "BCSO SIT+ Complaint Form", "https://google.ca/" ],
                    [ "Discipline Appeal Form", "https://google.ca/" ],
                    [ "Corporal EOI Form", "https://google.ca/" ],
                    [ "BCSO Transfer Guidelines", "https://google.ca/" ],
                    [ "BCSO Promotion and Activity Guidelines", "https://google.ca/" ],
                    [ "BCSO General Policing Guide", "https://google.ca/" ],
                    [ "BCSO/LCSO Jurisdiction Map", "https://google.ca/" ],
                    [ "County Assignments Speed Limits", "https://google.ca/" ],
                ]
            },
            {
                section: "Continuing Education Program",
                links: [
                    [ "Advanced Pursuit", "https://google.ca/" ],
                    [ "Off-Roading", "https://google.ca/" ],
                    [ "De-Escalation", "https://google.ca/" ],
                    [ "Basics of LE", "https://google.ca/" ],
                    [ "Bicycle", "https://google.ca/" ],
                    [ "TIMs", "https://google.ca/" ],
                    [ "Investigations and Evidence", "https://google.ca/" ],
                    [ "Basics of First Aid", "https://google.ca/" ],
                ]
            }
        ]
        const embed = this.base(false)
            .setTitle("__**BCSO Important Materials**__")
            .setThumbnail("attachment://bcsoLogo.png")
            .setFooter({ text: "Last Updated Mar 9th 2024" })
            .setColor(Colour.BCSO_BLUE)
            .setFields(links.map(elem => {
                return {
                    name: elem.section,
                    value: elem.links.map(link => `• [${link[0]}](${link[1]})`).join("\n")
                }
            }));

        return [ embed, attachment ];
    }

    public async importantLinksWsu(): Promise<[ EmbedBuilder, AttachmentBuilder ]> {
        const subInfo = await DbLogic.getSubdivisionInfoByAbbr("WSU");
        const attachment = new AttachmentBuilder("./assets/wsuLogo.png");
        const applicationLink = "https://google.ca/"
        const links = {
            section: "WSU Resources",
            links: [
                [ "Subdivision Roster", "https://google.ca/" ],
                [ "Subdivision SOP", "https://google.ca/" ],
                [ "Subdivision Policies", "https://google.ca/" ],
                [ "Subdivision Structures", "https://google.ca/" ],
            ]
        }
        const embed = this.base(false)
            .setTitle("__**Warrant Services Unit**__")
            .setThumbnail("attachment://wsuLogo.png")
            .setColor(Colour.WSU_RED)
            .setFooter({ text: "Last Updated Mar 9th 2024" })
            .setFields(
                {
                    name: links.section,
                    value: links.links.map(link => `• [${link[0]}](${link[1]})`).join("\n")
                },
                {
                    name: "Application Status:",
                    value: subInfo === null 
                        ? "Unknown, contact WSU CoC" 
                        : subInfo.applicationsOpen 
                            ? `**[Open for ${subInfo.minimumRank}+](${applicationLink})**`
                            : `Closed as of <t:${toUnixTime(subInfo.updated)}:D>`
                }
            );

        return [ embed, attachment ];
    }

    public async importantLinksWlr(): Promise<[ EmbedBuilder, AttachmentBuilder ]> {
        const subInfo = await DbLogic.getSubdivisionInfoByAbbr("WLR");
        const attachment = new AttachmentBuilder("./assets/wlrLogo.png");
        const applicationLink = "https://google.ca/"
        const links = {
            section: "WLR Resources",
            links: [
                [ "Subdivision Roster", "https://google.ca/" ],
                [ "Subdivision SOP", "https://google.ca/" ],
                [ "Subdivision Policies", "https://google.ca/" ],
                [ "Subdivision Structures", "https://google.ca/" ],
            ]
        }
        const embed = this.base(false)
            .setTitle("__**Wildlife Rangers**__")
            .setThumbnail("attachment://wlrLogo.png")
            .setColor(Colour.WLR_GREEN)
            .setFooter({ text: "Last Updated Mar 9th 2024" })
            .setFields(
                {
                    name: links.section,
                    value: links.links.map(link => `• [${link[0]}](${link[1]})`).join("\n")
                },
                {
                    name: "Application Status:",
                    value: subInfo === null 
                        ? "Unknown, contact WLR CoC" 
                        : subInfo.applicationsOpen 
                            ? `**[Open for ${subInfo.minimumRank}+](${applicationLink})**`
                            : `Closed as of <t:${toUnixTime(subInfo.updated)}:D>`
                }
            );

        return [ embed, attachment ];
    }

    public async importantLinksCid(): Promise<[ EmbedBuilder, AttachmentBuilder ]> {
        const subInfo = await DbLogic.getSubdivisionInfoByAbbr("CID");
        const attachment = new AttachmentBuilder("./assets/cidLogo.png");
        const applicationLink = "https://google.ca/"
        const links = {
            section: "CID Resources",
            links: [
                [ "Subdivision Roster", "https://google.ca/" ],
                [ "Subdivision SOP", "https://google.ca/" ],
                [ "Subdivision Policies", "https://google.ca/" ],
                [ "Subdivision Structures", "https://google.ca/" ],
            ]
        }
        const embed = this.base(false)
            .setTitle("__**Criminal Investigations Division**__")
            .setThumbnail("attachment://cidLogo.png")
            .setColor(Colour.CID_BLUE)
            .setFooter({ text: "Last Updated Mar 9th 2024" })
            .setFields(
                {
                    name: links.section,
                    value: links.links.map(link => `• [${link[0]}](${link[1]})`).join("\n")
                },
                {
                    name: "Application Status:",
                    value: subInfo === null 
                        ? "Unknown, contact CID CoC" 
                        : subInfo.applicationsOpen 
                            ? `**[Open for ${subInfo.minimumRank}+](${applicationLink})**`
                            : `Closed as of <t:${toUnixTime(subInfo.updated)}:D>`
                }
            );

        return [ embed, attachment ];
    }

    public async importantLinksTed(): Promise<[ EmbedBuilder, AttachmentBuilder ]> {
        const subInfo = await DbLogic.getSubdivisionInfoByAbbr("TED");
        const attachment = new AttachmentBuilder("./assets/tedLogo.png");
        const applicationLink = "https://google.ca/"
        const links = {
            section: "TED Resources",
            links: [
                [ "Subdivision Roster", "https://google.ca/" ],
                [ "Subdivision SOP", "https://google.ca/" ],
                [ "Subdivision Policies", "https://google.ca/" ],
                [ "Subdivision Structures", "https://google.ca/" ],
            ]
        }
        const embed = this.base(false)
            .setTitle("__**Traffic Enforcement Division**__")
            .setThumbnail("attachment://tedLogo.png")
            .setColor(Colour.TED_YELLOW)
            .setFooter({ text: "Last Updated Mar 9th 2024" })
            .setFields(
                {
                    name: links.section,
                    value: links.links.map(link => `• [${link[0]}](${link[1]})`).join("\n")
                },
                {
                    name: "Application Status:",
                    value: subInfo === null 
                        ? "Unknown, contact TED CoC" 
                        : subInfo.applicationsOpen 
                            ? `**[Open for ${subInfo.minimumRank}+](${applicationLink})**`
                            : `Closed as of <t:${toUnixTime(subInfo.updated)}:D>`
                }
            );

        return [ embed, attachment ];
    }

    public async importantLinksK9(): Promise<[ EmbedBuilder, AttachmentBuilder ]> {
        const subInfo = await DbLogic.getSubdivisionInfoByAbbr("K9");
        const attachment = new AttachmentBuilder("./assets/k9Logo.png");
        const applicationLink = "https://google.ca/"
        const links = {
            section: "K9 Resources",
            links: [
                [ "Subdivision Roster", "https://google.ca/" ],
                [ "Subdivision SOP", "https://google.ca/" ],
                [ "Subdivision Policies", "https://google.ca/" ],
                [ "Subdivision Structures", "https://google.ca/" ],
            ]
        }
        const embed = this.base(false)
            .setTitle("__**Canine Unit**__")
            .setThumbnail("attachment://k9Logo.png")
            .setColor(Colour.K9_BLUE)
            .setFooter({ text: "Last Updated Mar 9th 2024" })
            .setFields(
                {
                    name: links.section,
                    value: links.links.map(link => `• [${link[0]}](${link[1]})`).join("\n")
                },
                {
                    name: "Application Status:",
                    value: subInfo === null 
                        ? "Unknown, contact K9 CoC" 
                        : subInfo.applicationsOpen 
                            ? `**[Open for ${subInfo.minimumRank}+](${applicationLink})**`
                            : `Closed as of <t:${toUnixTime(subInfo.updated)}:D>`
                }
            );

        return [ embed, attachment ];
    }

    public raRequests(client: ExtendedClient, roles: { role: Role | undefined, emoji: GuildEmoji | undefined }[]): EmbedBuilder {
        return this.base(false)
            .setTitle("__**BCSO Ride Along Requests**__")
            .setFooter({ text: "Last Updated Mar 18th 2024" })
            .setDescription("In an effort to reduce the amount of subdivision pings members receive, the following roles " 
            + "have been implimented for interested members. If you are a sub-division member able and wanting to conduct "
            + "ride alongs for recruits/trainees of the sub-division, please follow the instructions below. You should not "
            + "have any of these roles if you are the recruit/trainee in the sub-division.\n\n"
            + "Everyday at 12:00am EST this channel will delete all messages besides this message to avoid clutter. "
            + "Improper use of this channel may result in revocations of the permissions to use it.")
            .setFields(
                {
                    name: "Channel Guidelines",
                    value: "- Trainees/Recruits should ping the `@Offering [Sub-Division] Ride Alongs` when wanting a Ride "
                    + "Along. Also, Deputies not in the sub-division, but interested to go on a ride along may ping this "
                    + "role.\n"
                    + "- Regular BCSO Deputies wanting to just 10-12 with another BCSO Deputy may ping the BCSO 10-12 role.\n"
                    + "- To toggle a role, click the button below for the associated role.\n"
                    + "- Do not ping any roles besides the ones listed in this message, the _only_ exception is to ping Sub-Division "
                    + "CoC Members to give an evaluation."
                },
                {
                    name: "Available Roles",
                    value: roles.map(elem => {
                        if (elem.role === undefined) return null;

                        return format(
                            "- [%s] %s", 
                            elem.emoji === undefined ? elem.role.name : elem.emoji.toString(),
                            elem.role.toString());
                    }).filter(Filters.notNull).join("\n")
                }
            );
    }

    public ftoRideAlong(rideAlongs: DbFtoRideAlong[]): EmbedBuilder {
        return this.base()
            .setTitle("__**DepuTRON Commands: In Service Ride Alongs**__")
            .setDescription("This channel was created for Deputies In Training that need to request an FTO/FTA Ride Along as mandated by the DoJRP Recruitment and Training Division. Below, you will find simple instructions on how to use the BCSO Discord Bot to request these 10-12s. FTAs and FTOs will also use the bot to acknowledge requests. These requests will be automatically deleted at 12:00am EST everyday to open an opportunity for others.")
            .addFields(
                { name: Constants.BlankSpace, value: Constants.BlankSpace },
                { name: "Deputy In Training", value: "Insert DIT instructions here" },
                { name: Constants.BlankSpace, value: Constants.BlankSpace },
                { name: "FTA/FTO+", value: "Insert FTA/FTO instructions here" },
                { name: Constants.BlankSpace, value: Constants.BlankSpace },
                { name: "Note:", value: "Insert notes here" },
                { name: Constants.BlankSpace, value: Constants.BlankSpace },
                { name: "Queue Position", value: rideAlongs.length === 0 ? Constants.BlankSpace : rideAlongs.map(elem => elem.queuePos).join("\n"), inline: true },
                { name: "Deputy In Training", value: rideAlongs.length === 0 ? Constants.BlankSpace : rideAlongs.map(elem => `${elem.username} (${elem.id})`).join("\n"), inline: true },
                { name: "Ride Along #", value: rideAlongs.length === 0 ? Constants.BlankSpace : rideAlongs.map(elem => elem.rideAlongNum).join("\n"), inline: true },
            )
    }

    public voteEmbed(data: {
        startingMember: GuildMember | string,
        startTime: Date | string,
        title: string,
        details: string,
        target: "BCSO" | "WSU" | "CID" | "TED" | "WLR" | "K9",
        status: "Active" | "Denied" | "Approved" | "Closed",
        voteId?: string,
        footer?: EmbedFooterData,
        endingMember?: GuildMember,
        endedTime?: Date,
        statusTime?: Date,
    }): EmbedBuilder {
        let embed = this.base()
            .setTitle(data.title);

        switch (data.target) {
            case "BCSO":
                embed = embed.setDescription("The following vote has been initiated for consideration by the Blaine County Sheriff's Office Chain of Command. Please discuss and vote while said vote remains open.");
                break;

            case "WSU":
                embed = embed.setDescription("The following vote has been initiated for consideration by the Warrant Services Unit's Chain of Command. Please discuss and vote while said vote remains open.");
                break;

            case "CID":
                embed = embed.setDescription("The following vote has been initiated for consideration by the Criminal Investigation Division's Chain of Command. Please discuss and vote while said vote remains open.");
                break;

            case "TED":
                embed = embed.setDescription("The following vote has been initiated for consideration by the Traffic Enforcement Division's Chain of Command. Please discuss and vote while said vote remains open.");
                break;

            case "WLR":
                embed = embed.setDescription("The following vote has been initiated for consideration by the Wildlife Rangers's Chain of Command. Please discuss and vote while said vote remains open.");
                break;

            case "K9":
                embed = embed.setDescription("The following vote has been initiated for consideration by the Canine Unit's Chain of Command. Please discuss and vote while said vote remains open.");
                break;
        }

        switch (data.status) {
            case "Active":
                embed = embed.setColor(Colour.VOTING_YELLOW);
                break;

            case "Denied":
                embed = embed.setColor(Colour.VOTING_RED);
                break;

            case "Approved":
                embed = embed.setColor(Colour.VOTING_APPROVED_GREEN);
                break;

            case "Closed":
                embed = embed.setColor(Colour.VOTING_GRAY);
                break;
        }

        if (data.footer !== undefined) embed = embed.setFooter(data.footer);
        else embed = embed.setFooter(null);

        let voteStatusMsg = "Unknown";
        switch (data.status) {
            case "Active":
                voteStatusMsg = "Active";
                break;

            case "Denied":
            case "Approved":
            case "Closed":
                voteStatusMsg = format("%s as of <t:%s:f>", data.status, toUnixTime(data.statusTime));
                break;
        }

        embed = embed.setFields(
            { name: "Vote Started By:", value: typeof data.startingMember === "string" ? data.startingMember : data.startingMember.nickname ?? data.startingMember.displayName, inline: true },
            { name: "Vote Started On:", value: typeof data.startTime === "string" ? data.startTime : `<t:${toUnixTime(data.startTime)}:f>`, inline: true},
            { name: "Vote Status:", value: voteStatusMsg, inline: false},
            { name: "Vote Ended By:", value: data.endingMember === undefined ? "-" : data.endingMember.nickname ?? data.endingMember.displayName, inline: true},
            { name: "Vote Ended On:", value: data.endedTime === undefined ? "-" : format("<t:%s:f>", toUnixTime(data.endedTime)), inline: true},
            { name: "Vote ID:", value: data.voteId ?? "TBD", inline: false},
            { name: "Vote Information:", value: data.details, inline: false}
        );

        return embed;
    }

    public subdivisionCoC(guild: Guild, subdivision: "WSU" | "CID" | "TED" | "WLR" | "K9"): [ EmbedBuilder, AttachmentBuilder ] {
        const attachmentName = format("%sLogo.png", subdivision.toLowerCase());
        const attachment = new AttachmentBuilder(format("./assets/%s", attachmentName));
        let coordinatorRole: RoleName;
        let supervisorRole: RoleName;
        let advisorRole: RoleName;
        let embed = this.base()
            .setTitle(format("**%s Chain of Command**", subdivision))
            .setThumbnail(format("attachment://%s", attachmentName));

        switch (subdivision) {
            case "WSU":
                embed = embed
                    .setColor(Colour.WSU_RED)
                    .setFooter({ text: "We hunt the evil others pretend doesn't exist" });
                coordinatorRole = RoleName.WSU_COORDINATOR;
                supervisorRole = RoleName.WSU_SUPERVISOR;
                advisorRole = RoleName.WSU_TEAM_LEAD;
                break;

            case "CID":
                embed = embed.setColor(Colour.CID_BLUE);
                coordinatorRole = RoleName.CID_COORDINAOR;
                supervisorRole = RoleName.CID_SUPERVISOR;
                advisorRole = RoleName.SENIOR_INVESTIGATOR;
                break;

            case "WLR":
                embed = embed.setColor(Colour.WLR_GREEN);
                coordinatorRole = RoleName.WLR_COORDINATOR;
                supervisorRole = RoleName.WLR_SUPERVISOR;
                advisorRole = RoleName.SENIOR_RANGER;
                break;
                
            case "TED":
                embed = embed.setColor(Colour.TED_YELLOW);
                coordinatorRole = RoleName.TED_COORDINATOR;
                supervisorRole = RoleName.TED_SUPERVISOR;
                advisorRole = RoleName.TED_ADVISOR;
                break;
                
            case "K9":
                embed = embed.setColor(Colour.K9_BLUE);
                coordinatorRole = RoleName.K9_COORDINATOR;
                supervisorRole = RoleName.K9_SUPERVISOR;
                advisorRole = RoleName.SENIOR_K9_DEPUTY;
                break;
        
            default: return [ embed, attachment ];
        }

        const coordinators = guild.roles.cache.find(elem => elem.name === coordinatorRole)?.members;
        const supervisors = guild.roles.cache.find(elem => elem.name === supervisorRole)?.members.filter(elem => !coordinators?.has(elem.id));
        const advisors = guild.roles.cache.find(elem => elem.name === advisorRole)?.members.filter(elem => !coordinators?.has(elem.id) && !supervisors?.has(elem.id));
        const sections = []

        if (coordinators !== undefined && coordinators.size > 0) sections.push(format(
            "__**%s**__\n%s",
            coordinatorRole,
            coordinators.map(elem => format("%s (%s)", elem.toString(), elem.user.username)).join("\n")
        ));

        if (supervisors !== undefined && supervisors.size > 0) sections.push(format(
            "__**%s**__\n%s",
            supervisorRole,
            supervisors.map(elem => format("%s (%s)", elem.toString(), elem.user.username)).join("\n")
        ));

        if (advisors !== undefined && advisors.size > 0) sections.push(format(
            "__**%s**__\n%s",
            advisorRole,
            advisors.map(elem => format("%s (%s)", elem.toString(), elem.user.username)).join("\n")
        ));
        
        return [
            embed.setDescription(sections.length === 0 ? "N/A" : sections.join("\n\n")),
            attachment
        ];
    }

    public loa(): EmbedBuilder {
        return this.base()
            .setTitle("**BCSO Leave of Absence**")
            .setDescription("This channel is for use by all deputies of the BCSO who are submitting, extending, or returning from an LOA.\n"
            + "- When *submitting* an loa, click the `LOA Form` button to be linked to the LOA form and fill it out.\n"
            + "- When *returning* from an loa, click the `Returning From LOA` button and provide the link to your LOA.\n"
            + "- When *extending* a loa, comment on your LOA post describing the extension, and then click the `Extending LOA` button and provide the link to your LOA\n\n"
            + "If your LOA is 7+ days in any given month, you will be exempt from the BCSO Hour Requirement for the month. If you are exempt for the month, then you will have \"LOA\" in your current hours on the Public Roster.\n\n"
            + "If your LOA is extending to a total of over 31 days for the entire LOA, please contact a BCSO Administrator if possible for an extension.\n\n"
            + "If you have any questions regarding this process, feel free to speak with a member of your CoC.\n\n"
            + "When posting here, DO NOT @ PEOPLE. Staff+ will be watching this closely so there is no reason to tag people or mention roles. Also, sub-division COC will be alerted of your LOA. No need to ping them.\n\n");
    }

    public rideAlongAccepted(deputyInTraining: GuildMember, acceptor: GuildMember): EmbedBuilder {
        return this.base()
            .setColor(Colour.SUCCESS_GREEN)
            .setTitle("**Ride Along Accepted**")
            .setDescription(format(
                "%s (%s), your ride along quest has been accepted by %s (%s)\nYou have 5 minutes to join the %s voice chat before your request is canceled.",
                deputyInTraining.nickname ?? deputyInTraining.user.username,
                deputyInTraining.id,
                acceptor.nickname ?? acceptor.user.username,
                acceptor.id,
                acceptor.voice.channel?.toString() ?? "FTO 10-12"));
    }

    public loaReturning(member: GuildMember, link: string): EmbedBuilder {
        return this.base()
            .setColor(Colour.LOA_RETURNING)
            .setDescription(format(
                "%s (%s) is **returning** from their [loa](%s)",
                member.toString(),
                member.nickname ?? member.displayName,
                link));
    }

    public loaExtending(member: GuildMember, link: string): EmbedBuilder {
        return this.base()
            .setColor(Colour.LOA_EXTENDING)
            .setDescription(format(
                "%s (%s) is **extending** their [loa](%s)",
                member.toString(),
                member.nickname ?? member.displayName,
                link));
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