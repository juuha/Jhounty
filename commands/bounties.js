const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { cycle1, cycle2, cycle3, cycle4 } = require('../bounty_cycles.json');
const { cycle1offset, cycle2offset, cycle3offset, cycle4offset } = require('../config.json');
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const tempIsShort = true;
const tempSelectedDays = ["Monday", "Wednesday"];

module.exports = {
    data: new SlashCommandBuilder().setName('bounties').setDescription('Shows the bounties for the week'),
    async execute(interaction) {
        
        let message = "";
        const cycleIndices = getCycleIndices()
        const nameType = tempIsShort ? "short" : "name";

        for (let day = 0; day < weekdays.length; day++) {
            if (tempSelectedDays.includes(weekdays[day])) {
                message += setDayMessage(day, nameType, cycleIndices);
            }
        }

        message += setMissingBounties(nameType, cycleIndices);

        const embed = new EmbedBuilder()
            .setTitle("Raid bounties this week:")
            .setColor(0x00FFFF)
            .setDescription(message)

        await interaction.reply({
            embeds: [embed]
        });
    },
};

function setDayMessage(day, nameType, cycleIndices) {
    const dayMessage = `**${weekdays[day]}: **${cycle1[(cycleIndices[0] + day) % cycle1.length][nameType]}, ` +
        `${cycle2[(cycleIndices[1] + day) % cycle2.length][nameType]}, ` +
        `${cycle3[(cycleIndices[2] + day) % cycle3.length][nameType]} & ` +
        `${cycle4[(cycleIndices[3] + day) % cycle4.length][nameType]}.\n`;
    return dayMessage
}

function setMissingBounties(nameType, cycleIndices) {
    var missingBounties = "**Not a daily: **";
    const cycles = [cycle1, cycle2, cycle3, cycle4]
    const bounties = [];
    for (let index = 0; index < cycles.length; index++) {
        const cycle = cycles[index];
        for (let bonusDay = 7; bonusDay < cycle.length; bonusDay++) {
            bounties.push(cycle[(cycleIndices[index] + bonusDay) % cycle.length][nameType]);
        }
    }
    for (let bounty = 0; bounty < bounties.length; bounty++) {
        if (bounty === bounties.length - 2) {
            // second to last one
            missingBounties += `${bounties[bounty]} & `
        } else if (bounty === bounties.length - 1) {
            // last one
            missingBounties += `${bounties[bounty]}.`
        } else {
            missingBounties += `${bounties[bounty]}, `
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
