USE `peter-bot`;

DROP TABLE IF EXISTS
    `captchas`,
    `static-message`;


-- -----[ Captchas Table | Start ]-----
CREATE TABLE `captchas` (
    `id`                    INT NOT NULL AUTO_INCREMENT,
    `assignedUser`          VARCHAR(128) NOT NULL,
    `image`                 LONGBLOB NOT NULL,
    `value`                 CHAR(6) NOT NULL,
    `dataUrl`                 TEXT NOT NULL,
    `expires`               TIMESTAMP DEFAULT NULL,
    `updated`               TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created`               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_Captchas 
        PRIMARY KEY (id),
    CONSTRAINT UK_Captchas_AssignedUser
        UNIQUE (assignedUser)
);
-- -----[ Captchas Table | End ]-----

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
