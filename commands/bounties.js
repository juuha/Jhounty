const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { cycle1, cycle2, cycle3, cycle4 } = require('../bounty_cycles.json');
const { cycle1offset, cycle2offset, cycle3offset, cycle4offset } = require('../config.json');
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const tempSelectedDays = ["Monday", "Wednesday"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bounties')
        .setDescription('Shows the bounties for the week')
        .addBooleanOption((option) =>
            option
                .setName("shortened")
                .setDescription("Do you want short names?")
        )
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("What types of bounties do you want? Raids, Strikes or both?")
                .addChoices(
                    { name: "Raids", value: "raid" },
                    { name: "Strikes", value: "strike" },
                    { name: "Both", value: "both" }
                )
        ),
    async execute(interaction) {
        const bountyType = interaction.options.getString("type") ?? "both";
        const nameType = interaction.options.getBoolean("shortened") ? "short" : "name";
        const cycleIndices = getCycleIndices()
        const title = setTitle(bountyType);
        let message = "";

        for (let day = 0; day < weekdays.length; day++) {
            if (tempSelectedDays.includes(weekdays[day])) {
                message += setDayMessage(day, nameType, bountyType, cycleIndices);
            }
        }

        message += setMissingBounties(nameType, bountyType, cycleIndices);

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(0x00FFFF)
            .setDescription(message)

        await interaction.reply({
            embeds: [embed]
        });
    },
};

function setDayMessage(day, nameType, bountyType, cycleIndices) {
    let dayMessage = `**${weekdays[day]}: **`;
    const cycles = [cycle1, cycle2, cycle3, cycle4];
    const bounties = [];
    for (let cycleIndex = 0; cycleIndex < cycles.length; cycleIndex++) {
        const cycle = cycles[cycleIndex];
        const bounty = cycle[(cycleIndices[cycleIndex] + day) % cycle.length];
        if (bountyType === bounty.type || bountyType === "both") {
            bounties.push(bounty[nameType]);
        }
    }
    for (let bountyIndex = 0; bountyIndex < bounties.length; bountyIndex++) {
        if (bountyIndex === bounties.length - 2) {
            // second to last one
            dayMessage += `${bounties[bountyIndex]} & `;
        } else if (bountyIndex === bounties.length - 1) {
            // last one
            dayMessage += `${bounties[bountyIndex]}.\n`;
        } else {
            dayMessage += `${bounties[bountyIndex]}, `;
        }
    }
    return dayMessage
}

function setMissingBounties(nameType, bountyType, cycleIndices) {
    var missingBounties = "**Not a daily: **";
    const cycles = [cycle1, cycle2, cycle3, cycle4];
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
    for (let bounty = 0; bounty < bounties.length; bounty++) {
        if (bounty === bounties.length - 2) {
            // second to last one
            missingBounties += `${bounties[bounty]} & `;
        } else if (bounty === bounties.length - 1) {
            // last one
            missingBounties += `${bounties[bounty]}.`;
        } else {
            missingBounties += `${bounties[bounty]}, `;
        }
    }
    return missingBounties
}

function getCycleIndices() {
    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const cycle1Index = (daysSinceEpoch + cycle1offset - (today.getDay() - 1)) % cycle1.length;
    const cycle2Index = (daysSinceEpoch + cycle2offset - (today.getDay() - 1)) % cycle2.length;
    const cycle3Index = (daysSinceEpoch + cycle3offset - (today.getDay() - 1)) % cycle3.length;
    const cycle4Index = (daysSinceEpoch + cycle4offset - (today.getDay() - 1)) % cycle4.length;
    return [cycle1Index, cycle2Index, cycle3Index, cycle4Index];
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
