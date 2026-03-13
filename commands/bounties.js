const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, LabelBuilder, MessageFlags } = require('discord.js');
const fs = require("node:fs");
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Bountyless"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bounties')
        .setDescription(`Display your personal default Bounties view or the global view if it has not been saved.`)
        .addBooleanOption((option) =>
            option
                .setName("global")
                .setDescription("Display the global default Bounties view instead.")
        )
        .addBooleanOption((option) =>
            option
                .setName("custom")
                .setDescription("Display a custom Bounties view.")
        ),
    async execute(interaction) {
        const { cycles, cycleOffsets } = require('../data/bounty_cycles.json');
        const defaultProfiles = require("../data/profile_defaults.json");
        const cycleIndices = getCycleIndices(cycles, cycleOffsets)
        const showGlobalDefault = interaction.options.getBoolean("global");
        const createCustom = interaction.options.getBoolean("custom");

        if (createCustom) {
            const modal = createBountiesModal()
            await interaction.showModal(modal);
            handleBountyModalAndReply(interaction, cycles, cycleIndices)
            return;
        }

        let profile = defaultProfiles[interaction.user.id];
        if (showGlobalDefault || profile === undefined) {
            profile = defaultProfiles[interaction.guildId] ?? defaultProfiles["fallback"];
        }

        await replyBounty(interaction, profile.nameType, profile.bountyType, profile.selectedDays, cycles, cycleIndices);
    },
};

function setDayMessage(day, nameType, bountyType, cycles, cycleIndices) {
    const bounties = [];
    for (let cycleIndex = 0; cycleIndex < cycles.length; cycleIndex++) {
        const cycle = cycles[cycleIndex];
        const bounty = cycle[(cycleIndices[cycleIndex] + day) % cycle.length];
        if (bountyType === bounty.type || bountyType === "both") {
            bounties.push(bounty[nameType]);
        }
    }
    return `**${weekdays[day]}: **` + concatenateBounties(bounties);
}

function setMissingBounties(nameType, bountyType, cycles, cycleIndices) {
    const bounties = [];
    for (let index = 0; index < cycles.length; index++) {
        const cycle = cycles[index];
        for (let bonusDay = 7; bonusDay < cycle.length; bonusDay++) {
            const bounty = cycle[(cycleIndices[index] + bonusDay) % cycle.length];
            if (bountyType === bounty.type || bountyType === "both") {
                bounties.push(bounty[nameType]);
            }
        }
    }
    return "**Bountyless: **" + concatenateBounties(bounties);
}

function concatenateBounties(bounties) {
    let bountyMessage = "";
    for (let bountyIndex = 0; bountyIndex < bounties.length; bountyIndex++) {
        if (bountyIndex === bounties.length - 2) {
            // second to last one
            bountyMessage += `${bounties[bountyIndex]} & `;
        } else if (bountyIndex === bounties.length - 1) {
            // last one
            bountyMessage += `${bounties[bountyIndex]}.\n`;
        } else {
            bountyMessage += `${bounties[bountyIndex]}, `;
        }
    }
    return bountyMessage;
}

function getCycleIndices(cycles, cycleoffsets) {
    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const cycleIndices = []
    for (let index = 0; index < cycles.length; index++) {
        cycleIndices.push((daysSinceEpoch + cycleoffsets[index] - (today.getDay() - 1)) % cycles[index].length);
    }
    return cycleIndices;
}

function setTitle(bountyType) {
    if (bountyType === "raid") {
        return "Raid (no strikes) bounties this week:"
    } else if (bountyType === "strike") {
        return "Strike (no raids) bounties this week:"
    } else {
        return "Both raid and strike bounties this week:"
    }
}

async function replyBounty(interaction, nameType = "name", bountyType = "both", selectedDays = weekdays, cycles, cycleIndices) {
    const title = setTitle(bountyType);
    let message = "";

    for (let day = 0; day < weekdays.length; day++) {
        if (selectedDays.includes(weekdays[day])) {
            if (weekdays[day] === "Bountyless") {
                message += setMissingBounties(nameType, bountyType, cycles, cycleIndices);
            } else {
                message += setDayMessage(day, nameType, bountyType, cycles, cycleIndices);
            }
        }
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(0x00FFFF)
        .setDescription(message);

    await interaction.reply({
        embeds: [embed]
    });
}

function createBountiesModal() {
    const bountiesModal = new ModalBuilder()
        .setCustomId("bountiesModal")
        .setTitle("How do you want the bounties to look like?");

    const shortInput = new StringSelectMenuBuilder()
        .setCustomId("nameType")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Short names")
                .setValue("short"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Long names")
                .setValue("name")
        );

    const shortLabel = new LabelBuilder()
        .setLabel("Do you want full names or shortened names?")
        .setDescription("Names are short by default.")
        .setStringSelectMenuComponent(shortInput);

    const bountyTypeInput = new StringSelectMenuBuilder()
        .setCustomId("bountyType")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Raids")
                .setValue("raid"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Strikes")
                .setValue("strike"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Both Raids and Strikes")
                .setValue("both")
        );

    const bountyTypeLabel = new LabelBuilder()
        .setLabel("Do you want to show Raids or Strikes?")
        .setDescription("Both are shown by default.")
        .setStringSelectMenuComponent(bountyTypeInput);

    const daysInput = new StringSelectMenuBuilder()
        .setCustomId("days")
        .setMinValues(1)
        .setMaxValues(8)
        .setRequired(true)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Monday")
                .setValue("Monday"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Tuesday")
                .setValue("Tuesday"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Wednesday")
                .setValue("Wednesday"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Thursday")
                .setValue("Thursday"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Friday")
                .setValue("Friday"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Saturday")
                .setValue("Saturday"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Sunday")
                .setValue("Sunday"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Bountyless")
                .setValue("Bountyless"),
        );

    const daysLabel = new LabelBuilder()
        .setLabel("Choose all days you want to see bounties for.")
        .setDescription("Bountyless means Raid encounters without bounties that week.")
        .setStringSelectMenuComponent(daysInput);

    const saveAsDefaultInput = new StringSelectMenuBuilder()
        .setCustomId("saveType")
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Save as personal default")
                .setValue("personalsave"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Save as global default")
                .setValue("globalsave"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Do not save")
                .setValue("nosave")
        );

    const saveAsDefaultLabel = new LabelBuilder()
        .setLabel("Save as personal or global default?")
        .setDescription("Personal default if set, will be shown instead of global. Not saved by default.")
        .setStringSelectMenuComponent(saveAsDefaultInput);

    bountiesModal.addLabelComponents(shortLabel, bountyTypeLabel, daysLabel, saveAsDefaultLabel);

    return bountiesModal;
}

function saveAsDefault(interaction, nameType, bountyType, selectedDays, saveType) {
    if (saveType === "nosave") return;
    const profileDefaults = require("../data/profile_defaults.json");

    const profile = {
        "nameType": nameType,
        "bountyType": bountyType,
        "selectedDays": selectedDays
    }

    if (saveType === "globalsave") {
        profileDefaults[interaction.guildId] = profile;
    } else if (saveType === "personalsave") {
        profileDefaults[interaction.user.id] = profile;
    }

    fs.writeFile('data/profile_defaults.json', JSON.stringify(profileDefaults, null, 4), async (error) => {
        if (error) { console.error(error); }
    });
}

async function handleBountyModalAndReply(interaction, cycles, cycleIndices) {
    const filter = (i) => i.customId === 'bountiesModal'
    try {
        const response = await interaction.awaitModalSubmit({
            filter,
            time: 300_000
        });

        const nameType = response.fields.getStringSelectValues("nameType")[0] ?? "name";
        const bountyType = response.fields.getStringSelectValues("bountyType")[0] ?? "both";
        const selectedDays = response.fields.getStringSelectValues("days");
        const saveType = response.fields.getStringSelectValues("saveType")[0] ?? "nosave";

        saveAsDefault(interaction, nameType, bountyType, selectedDays, saveType);

        await replyBounty(response, nameType, bountyType, selectedDays, cycles, cycleIndices);
    } catch {
        await interaction.followUp({
            content: "The form timed out (max 5 minutes).",
            flags: MessageFlags.Ephemeral
        });
    }
}
