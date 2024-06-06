import { SubscriptionConditionMap } from "./Condition";

export interface SubscriptionNameConditionMap {
    "automod.message.hold": SubscriptionConditionMap["AutomodMessageHold"];
    "automod.message.update": SubscriptionConditionMap["AutomodMessageUpdate"];
    "automod.settings.update": SubscriptionConditionMap["AutomodSettingsUpdate"];
    "automod.terms.update": SubscriptionConditionMap["AutomodTermsUpdate"];
    "channel.ad_break.begin": SubscriptionConditionMap["ChannelAdBreakBegin"];
    "channel.ban": SubscriptionConditionMap["ChannelBan"];
    "channel.chat.clear": SubscriptionConditionMap["ChannelChatClear"];
    "channel.chat.clear_user_messages": SubscriptionConditionMap["ChannelChatClearUserMessages"];
    "channel.chat.message": SubscriptionConditionMap["ChannelChatMessage"];
    "channel.chat.message_delete": SubscriptionConditionMap["ChannelChatMessageDelete"];
    "channel.chat.notification": SubscriptionConditionMap["ChannelChatNotification"];
    "channel.chat_settings.update": SubscriptionConditionMap["ChannelChatSettingsUpdate"];
    "channel.chat.user_message_hold": SubscriptionConditionMap["ChannelChatUserMessageHold"];
    "channel.chat.user_message_update": SubscriptionConditionMap["ChannelChatUserMessageUpdate"];
    "channel.subscribe": SubscriptionConditionMap["ChannelSubscribe"];
    "channel.subscription.end": SubscriptionConditionMap["ChannelSubscriptionEnd"];
    "channel.subscription.gift": SubscriptionConditionMap["ChannelSubscriptionGift"];
    "channel.subscription.message": SubscriptionConditionMap["ChannelSubscriptionMessage"];
    "channel.cheer": SubscriptionConditionMap["ChannelCheer"];
    "channel.update": SubscriptionConditionMap["ChannelUpdate"];
    "channel.follow": SubscriptionConditionMap["ChannelFollow"];
    "channel.unban": SubscriptionConditionMap["ChannelUnban"];
    "channel.unban_request.create": SubscriptionConditionMap["ChannelUnbanRequestCreate"];
    "channel.unban_request.resolve": SubscriptionConditionMap["ChannelUnbanRequestResolve"];
    "channel.raid": SubscriptionConditionMap["ChannelRaid"];
    "channel.moderate": SubscriptionConditionMap["ChannelModerate"];
    "channel.moderator.add": SubscriptionConditionMap["ChannelModerate"];
    "channel.moderator.remove": SubscriptionConditionMap["ChannelModerate"];
    "channel.guest_star_session.begin": SubscriptionConditionMap["ChannelGuestStarSessionBegin"];
    "channel.guest_star_session.end": SubscriptionConditionMap["ChannelGuestStarSessionEnd"];
    "channel.guest_star_guest.update": SubscriptionConditionMap["ChannelGuestStarSessionUpdate"];
    "channel.guest_star_settings.update": SubscriptionConditionMap["ChannelGuestStarSessionSettingUpdate"];
    "channel.channel_points_automatic_reward_redemption.add": SubscriptionConditionMap["ChannelPointsAutomaticRewardRedemptionAdd"];
    "channel.channel_points_custom_reward.add": SubscriptionConditionMap["ChannelPointsCustomRewardAdd"];
    "channel.channel_points_custom_reward.update": SubscriptionConditionMap["ChannelPointsCustomRewardUpdate"];
    "channel.channel_points_custom_reward.remove": SubscriptionConditionMap["ChannelPointsCustomRewardRemove"];
    "channel.channel_points_custom_reward_redemption.add": SubscriptionConditionMap["ChannelPointsCustomRewardRedemptionAdd"];
    "channel.channel_points_custom_reward_redemption.update": SubscriptionConditionMap["ChannelPointsCustomRewardRedemptionUpdate"];
    "channel.poll.begin": SubscriptionConditionMap["ChannelPollBegin"];
    "channel.poll.progress": SubscriptionConditionMap["ChannelPollProgress"];
    "channel.poll.end": SubscriptionConditionMap["ChannelPollEnd"];
    "channel.prediction.begin": SubscriptionConditionMap["ChannelPredictionBegin"];
    "channel.prediction.progress": SubscriptionConditionMap["ChannelPredictionProgress"];
    "channel.prediction.lock": SubscriptionConditionMap["ChannelPredictionLock"];
    "channel.prediction.end": SubscriptionConditionMap["ChannelPredictionEnd"];
    "channel.suspicious_user.message": SubscriptionConditionMap["ChannelSuspiciousUserMessage"];
    "channel.suspicious_user.update": SubscriptionConditionMap["ChannelSuspiciousUserUpdate"];
    "channel.vip.add": SubscriptionConditionMap["ChannelVipAdd"];
    "channel.vip.remove": SubscriptionConditionMap["ChannelVipRemove"];
    "conduit.shard.disabled": SubscriptionConditionMap["ConduitShardDisabled"];
    "drop.entitlement.grant": SubscriptionConditionMap["DropEntitlementGrant"];
    "extension.bits_transaction.create": SubscriptionConditionMap["ExtensionBitsTransactionCreate"];
    "channel.goal.begin": SubscriptionConditionMap["Goals"];
    "channel.goal.progress": SubscriptionConditionMap["Goals"];
    "channel.goal.end": SubscriptionConditionMap["Goals"];
    "channel.hype_train.begin": SubscriptionConditionMap["HypeTrainBegin"];
    "channel.hype_train.progress": SubscriptionConditionMap["HypeTrainProgress"];
    "channel.hype_train.end": SubscriptionConditionMap["HypeTrainEnd"];
    "stream.online": SubscriptionConditionMap["StreamOnline"];
    "stream.offline": SubscriptionConditionMap["StreamOffline"];
    "user.authorization.grant": SubscriptionConditionMap["UserAuthorizationGrant"];
    "user.authorization.revoke": SubscriptionConditionMap["UserAuthorizationRevoke"];
    "user.update": SubscriptionConditionMap["UserAuthorizationUpdate"];
    "user.whisper.message": SubscriptionConditionMap["WhisperReceived"];

    // Unsupported
    // "channel.charity_campaign.donate": "TBD";
    // "channel.charity_campaign.start": "TBD";
    // "channel.charity_campaign.progress": "TBD";
    // "channel.charity_campaign.stop": "TBD";
    // "channel.shield_mode.begin": "TBD";
    // "channel.shield_mode.end": "TBD";
    // "channel.shoutout.create": "TBD";
    // "channel.shoutout.receive": "TBD";
}

export interface SubscriptionNameConditionKeyMap {
    "automod.message.hold": "AutomodMessageHold";
    "automod.message.update": "AutomodMessageUpdate";
    "automod.settings.update": "AutomodSettingsUpdate";
    "automod.terms.update": "AutomodTermsUpdate";
    "channel.ad_break.begin": "ChannelAdBreakBegin";
    "channel.ban": "ChannelBan";
    "channel.chat.clear": "ChannelChatClear";
    "channel.chat.clear_user_messages": "ChannelChatClearUserMessages";
    "channel.chat.message": "ChannelChatMessage";
    "channel.chat.message_delete": "ChannelChatMessageDelete";
    "channel.chat.notification": "ChannelChatNotification";
    "channel.chat_settings.update": "ChannelChatSettingsUpdate";
    "channel.chat.user_message_hold": "ChannelChatUserMessageHold";
    "channel.chat.user_message_update": "ChannelChatUserMessageUpdate";
    "channel.subscribe": "ChannelSubscribe";
    "channel.subscription.end": "ChannelSubscriptionEnd";
    "channel.subscription.gift": "ChannelSubscriptionGift";
    "channel.subscription.message": "ChannelSubscriptionMessage";
    "channel.cheer": "ChannelCheer";
    "channel.update": "ChannelUpdate";
    "channel.follow": "ChannelFollow";
    "channel.unban": "ChannelUnban";
    "channel.unban_request.create": "ChannelUnbanRequestCreate";
    "channel.unban_request.resolve": "ChannelUnbanRequestResolve";
    "channel.raid": "ChannelRaid";
    "channel.moderate": "ChannelModerate";
    "channel.moderator.add": "ChannelModerate";
    "channel.moderator.remove": "ChannelModerate";
    "channel.guest_star_session.begin": "ChannelGuestStarSessionBegin";
    "channel.guest_star_session.end": "ChannelGuestStarSessionEnd";
    "channel.guest_star_guest.update": "ChannelGuestStarSessionUpdate";
    "channel.guest_star_settings.update": "ChannelGuestStarSessionSettingUpdate";
    "channel.channel_points_automatic_reward_redemption.add": "ChannelPointsAutomaticRewardRedemptionAdd";
    "channel.channel_points_custom_reward.add": "ChannelPointsCustomRewardAdd";
    "channel.channel_points_custom_reward.update": "ChannelPointsCustomRewardUpdate";
    "channel.channel_points_custom_reward.remove": "ChannelPointsCustomRewardRemove";
    "channel.channel_points_custom_reward_redemption.add": "ChannelPointsCustomRewardRedemptionAdd";
    "channel.channel_points_custom_reward_redemption.update": "ChannelPointsCustomRewardRedemptionUpdate";
    "channel.poll.begin": "ChannelPollBegin";
    "channel.poll.progress": "ChannelPollProgress";
    "channel.poll.end": "ChannelPollEnd";
    "channel.prediction.begin": "ChannelPredictionBegin";
    "channel.prediction.progress": "ChannelPredictionProgress";
    "channel.prediction.lock": "ChannelPredictionLock";
    "channel.prediction.end": "ChannelPredictionEnd";
    "channel.suspicious_user.message": "ChannelSuspiciousUserMessage";
    "channel.suspicious_user.update": "ChannelSuspiciousUserUpdate";
    "channel.vip.add": "ChannelVipAdd";
    "channel.vip.remove": "ChannelVipRemove";
    "conduit.shard.disabled": "ConduitShardDisabled";
    "drop.entitlement.grant": "DropEntitlementGrant";
    "extension.bits_transaction.create": "ExtensionBitsTransactionCreate";
    "channel.goal.begin": "Goals";
    "channel.goal.progress": "Goals";
    "channel.goal.end": "Goals";
    "channel.hype_train.begin": "HypeTrainBegin";
    "channel.hype_train.progress": "HypeTrainProgress";
    "channel.hype_train.end": "HypeTrainEnd";
    "stream.online": "StreamOnline";
    "stream.offline": "StreamOffline";
    "user.authorization.grant": "UserAuthorizationGrant";
    "user.authorization.revoke": "UserAuthorizationRevoke";
    "user.update": "UserAuthorizationUpdate";
    "user.whisper.message": "WhisperReceived";

    // Unsupported
    // "channel.charity_campaign.donate": "TBD";
    // "channel.charity_campaign.start": "TBD";
    // "channel.charity_campaign.progress": "TBD";
    // "channel.charity_campaign.stop": "TBD";
    // "channel.shield_mode.begin": "TBD";
    // "channel.shield_mode.end": "TBD";
    // "channel.shoutout.create": "TBD";
    // "channel.shoutout.receive": "TBD";
}

export type SubscriptionType = keyof SubscriptionNameConditionMap;
