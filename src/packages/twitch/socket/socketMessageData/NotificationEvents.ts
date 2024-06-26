import { NotificationMessage } from "./messages/NotificationMessage";
import { SubscriptionConditionMap } from "./subscriptions/Condition";
import { SubscriptionEventMap } from "./subscriptions/events/SubscriptionEvents";

export type NotificationEvents = keyof SubscriptionConditionMap & keyof SubscriptionEventMap;

export type NotificationMessageType = {
    [K in NotificationEvents as string]: NotificationMessage<K>;
}

export const SubTypeEventNameMap: { [key: string]: NotificationEvents }  = {
    "automod.message.hold": "AutomodMessageHold",
    "automod.message.update": "AutomodMessageUpdate",
    "automod.settings.update": "AutomodSettingsUpdate",
    "automod.terms.update": "AutomodTermsUpdate",
    "channel.ad_break.begin": "ChannelAdBreakBegin",
    "channel.ban": "ChannelBan",
    "channel.chat.clear": "ChannelChatClear",
    "channel.chat.clear_user_messages": "ChannelChatClearUserMessages",
    "channel.chat.message": "ChannelChatMessage",
    "channel.chat.message_delete": "ChannelChatMessageDelete",
    "channel.chat.notification": "ChannelChatNotification",
    "channel.chat_settings.update": "ChannelChatSettingsUpdate",
    "channel.chat.user_message_hold": "ChannelChatUserMessageHold",
    "channel.chat.user_message_update": "ChannelChatUserMessageUpdate",
    "channel.subscribe": "ChannelSubscribe",
    "channel.subscription.end": "ChannelSubscriptionEnd",
    "channel.subscription.gift": "ChannelSubscriptionGift",
    "channel.subscription.message": "ChannelSubscriptionMessage",
    "channel.cheer": "ChannelCheer",
    "channel.update": "ChannelUpdate",
    "channel.follow": "ChannelFollow",
    "channel.unban": "ChannelUnban",
    "channel.unban_request.create": "ChannelUnbanRequestCreate",
    "channel.unban_request.resolve": "ChannelUnbanRequestResolve",
    "channel.raid": "ChannelRaid",
    "channel.moderate": "ChannelModerate",
    "channel.moderator.add": "ChannelModerate",
    "channel.moderator.remove": "ChannelModerate",
    "channel.guest_star_session.begin": "ChannelGuestStarSessionBegin",
    "channel.guest_star_session.end": "ChannelGuestStarSessionEnd",
    "channel.guest_star_guest.update": "ChannelGuestStarSessionUpdate",
    "channel.guest_star_settings.update": "ChannelGuestStarSessionSettingUpdate",
    "channel.channel_points_automatic_reward_redemption.add": "ChannelPointsAutomaticRewardRedemptionAdd",
    "channel.channel_points_custom_reward.add": "ChannelPointsCustomRewardAdd",
    "channel.channel_points_custom_reward.update": "ChannelPointsCustomRewardUpdate",
    "channel.channel_points_custom_reward.remove": "ChannelPointsCustomRewardRemove",
    "channel.channel_points_custom_reward_redemption.add": "ChannelPointsCustomRewardRedemptionAdd",
    "channel.channel_points_custom_reward_redemption.update": "ChannelPointsCustomRewardRedemptionUpdate",
    "channel.poll.begin": "ChannelPollBegin",
    "channel.poll.progress": "ChannelPollProgress",
    "channel.poll.end": "ChannelPollEnd",
    "channel.prediction.begin": "ChannelPredictionBegin",
    "channel.prediction.progress": "ChannelPredictionProgress",
    "channel.prediction.lock": "ChannelPredictionLock",
    "channel.prediction.end": "ChannelPredictionEnd",
    "channel.suspicious_user.message": "ChannelSuspiciousUserMessage",
    "channel.suspicious_user.update": "ChannelSuspiciousUserUpdate",
    "channel.vip.add": "ChannelVipAdd",
    "channel.vip.remove": "ChannelVipRemove",
    "conduit.shard.disabled": "ConduitShardDisabled",
    "drop.entitlement.grant": "DropEntitlementGrant",
    "extension.bits_transaction.create": "ExtensionBitsTransactionCreate",
    "channel.goal.begin": "Goals",
    "channel.goal.progress": "Goals",
    "channel.goal.end": "Goals",
    "channel.hype_train.begin": "HypeTrainBegin",
    "channel.hype_train.progress": "HypeTrainProgress",
    "channel.hype_train.end": "HypeTrainEnd",
    "stream.online": "StreamOnline",
    "stream.offline": "StreamOffline",
    "user.authorization.grant": "UserAuthorizationGrant",
    "user.authorization.revoke": "UserAuthorizationRevoke",
    "user.update": "UserAuthorizationUpdate",
    "user.whisper.message": "WhisperReceived",
}