USE `deputron`;

DROP TABLE IF EXISTS
    `fto-ride-along`,
    `static-message`,
    `subdivision-info`;


-- -----[ FTO Ride Along Table | Start ]-----
CREATE TABLE `fto-ride-along` (
    `id`                    VARCHAR(128) NOT NULL,
    `username`              VARCHAR(128) NOT NULL,
    `rideAlongNum`          INT NOT NULL,
    `queuePos`              INT NOT NULL,
    `updated`               TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created`               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_FtoRideAlong
        PRIMARY KEY (`id`),
    CONSTRAINT UK_FtoRideAlong_QueuePos 
        UNIQUE (`queuePos`),
    CONSTRAINT CHK_FtoRideAlong_RideAlongNum
        CHECK (`rideAlongNum`>=1 AND `rideAlongNum`<=4)
);
-- -----[ FTO Ride Along Table | End ]-----


-- -----[ Subdivision Info Table | Start ]-----
CREATE TABLE `subdivision-info` (
    `id`                    INT NOT NULL AUTO_INCREMENT,
    `abbreaviation`         VARCHAR(10) NOT NULL,
    `name`                  VARCHAR(128) NOT NULL,
    `applicationsOpen`      BOOL NOT NULL DEFAULT 0,
    `minimumRank`           VARCHAR(30) NOT NULL DEFAULT "Deputy I",
    `updated`               TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created`               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_SubdivisionInfo
        PRIMARY KEY (`id`)
);
-- -----[ Subdivision Info Table | End ]-----


-- -----[ Static Messages Table | Start ]-----
CREATE TABLE `static-message` (
    `id`                    INT NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(128) NOT NULL,
    `guildId`               VARCHAR(128) NOT NULL,
    `channelId`             VARCHAR(128) NOT NULL,
    `messageId`             VARCHAR(128) NOT NULL,
    `updated`               TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created`               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_StaticMessages
        PRIMARY KEY (`id`)
);
-- -----[ Static Messages Table | End ]-----


INSERT INTO `subdivision-info` (`abbreaviation`, `name`, `applicationsOpen`, `minimumRank`) VALUES
    ("WSU", "Warrant Services Unit", 1, "Deputy I"),
    ("WLR", "Wildlife Rangers", 1, "Deputy I"),
    ("CID", "Criminal Investigations Division", 1, "Deputy I"),
    ("TED", "Traffic Enforcement Division", 1, "Deputy I"),
    ("K9", "Canine Unit", 1, "Deputy I");