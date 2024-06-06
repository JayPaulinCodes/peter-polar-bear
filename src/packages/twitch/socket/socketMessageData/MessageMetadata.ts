import { PickOptional, PickRequired } from "../../UtilityTypes";

interface Metadata {
    message_id: string;
    message_type: string;
    message_timestamp: string;
    subscription_type: string;
    subscription_version: string;
}

export type Default = { [key: string]: any };

export type WelcomeMetadata = PickRequired<Metadata, "message_id" | "message_type" | "message_timestamp">;
export type KeepaliveMetadata = PickRequired<Metadata, "message_id" | "message_type" | "message_timestamp">;
export type NotificationMetadata = PickRequired<Metadata, "message_id" | "message_type" | "message_timestamp" | "subscription_type" | "subscription_version">;
export type ReconnectMetadata = PickRequired<Metadata, "message_id" | "message_type" | "message_timestamp">;
export type RevocationMetadata = PickRequired<Metadata, "message_id" | "message_type" | "message_timestamp" | "subscription_type" | "subscription_version">;

export interface MessageMetadataMap {
    "session_welcome": WelcomeMetadata;
    "session_keepalive": KeepaliveMetadata;
    "ping": Default;
    "notification": NotificationMetadata;
    "session_reconnect": ReconnectMetadata;
    "revocation": RevocationMetadata;
    "close": Default;
}

export type MessageMetadata = MessageMetadataMap[keyof MessageMetadataMap];

export type MessageType = keyof MessageMetadataMap;
