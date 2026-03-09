const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { cycle1, cycle2, cycle3, cycle4 } = require('../bounty_cycles.json')
const shortOffset = 1;
const longOffset = 9;
const short = true;

module.exports = {
    data: new SlashCommandBuilder().setName('bounties').setDescription('Shows the bounties for the week'),
    async execute(interaction) {
        let today = new Date();

        const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
        const shortIndex = (daysSinceEpoch + shortOffset - (today.getDay() - 1)) % 6;
        const longIndex = (daysSinceEpoch + longOffset - (today.getDay()) - 1) % 12;

        const monMessage = `**Monday: **${cycle1[shortIndex].short}, ${cycle2[longIndex].short}, ${cycle3[longIndex].short} & ${cycle4[shortIndex].short}.\n`;
        const tueMessage = `**Tuesday: **${cycle1[(shortIndex + 1) % 6].short}, ${cycle2[(longIndex + 1) % 12].short}, ${cycle3[(longIndex + 1) % 12].short} & ${cycle4[(shortIndex + 1) % 6].short}.\n`;
        const wedMessage = `**Wednesday: **${cycle1[(shortIndex + 2) % 6].short}, ${cycle2[(longIndex + 2) % 12].short}, ${cycle3[(longIndex + 2) % 12].short} & ${cycle4[(shortIndex + 2) % 6].short}.\n`;
        const thuMessage = `**Thursday: **${cycle1[(shortIndex + 3) % 6].short}, ${cycle2[(longIndex + 3) % 12].short}, ${cycle3[(longIndex + 3) % 12].short} & ${cycle4[(shortIndex + 3) % 6].short}.\n`;
        const friMessage = `**Friday: **${cycle1[(shortIndex + 4) % 6].short}, ${cycle2[(longIndex + 4) % 12].short}, ${cycle3[(longIndex + 4) % 12].short} & ${cycle4[(shortIndex + 4) % 6].short}.\n`;
        const satMessage = `**Saturday: **${cycle1[(shortIndex + 5) % 6].short}, ${cycle2[(longIndex + 5) % 12].short}, ${cycle3[(longIndex + 5) % 12].short} & ${cycle4[(shortIndex + 5) % 6].short}.\n`;
        const sunMessage = `**Sunday: **${cycle1[(shortIndex + 6) % 6].short}, ${cycle2[(longIndex + 6) % 12].short}, ${cycle3[(longIndex + 6) % 12].short} & ${cycle4[(shortIndex + 6) % 6].short}.\n`;
        const notMessage = `**Not a daily: ** ${cycle2[(longIndex + 7) % 12].short}, ${cycle2[(longIndex + 8) % 12].short}, ${cycle2[(longIndex + 9) % 12].short}, ${cycle2[(longIndex + 10) % 12].short}, ${cycle2[(longIndex + 11) % 12].short}, ${cycle3[(longIndex + 7) % 12].short}, ${cycle3[(longIndex + 8) % 12].short}, ${cycle3[(longIndex + 9) % 12].short}, ${cycle3[(longIndex + 10) % 12].short} & ${cycle3[(longIndex + 6) % 11].short}.`

        const message = monMessage + wedMessage + notMessage;

        const embed = new EmbedBuilder()
            .setTitle("Raid bounties this week:")
            .setColor(0x00FFFF)
            .setDescription(message)

        await interaction.reply({
            embeds: [embed]
        });
    },
};

