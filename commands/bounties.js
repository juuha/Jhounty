const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { cycle1full, cycle2full, cycle3full, cycle4full, cycle1short, cycle2short, cycle3short, cycle4short } = require('../bounty_cycles.json')
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

        const cycle1 = short ? cycle1short : cycle1full;
        const cycle2 = short ? cycle2short : cycle2full;
        const cycle3 = short ? cycle3short : cycle2full;
        const cycle4 = short ? cycle4short : cycle4full;

        const monMessage = `**Monday: **${cycle1[shortIndex]}, ${cycle2[longIndex]}, ${cycle3[longIndex]} & ${cycle4[shortIndex]}.\n`;
        const tueMessage = `**Tuesday: **${cycle1[(shortIndex + 1) % 6]}, ${cycle2[(longIndex + 1) % 12]}, ${cycle3[(longIndex + 1) % 12]} & ${cycle4[(shortIndex + 1) % 6]}.\n`;
        const wedMessage = `**Wednesday: **${cycle1[(shortIndex + 2) % 6]}, ${cycle2[(longIndex + 2) % 12]}, ${cycle3[(longIndex + 2) % 12]} & ${cycle4[(shortIndex + 2) % 6]}.\n`;
        const thuMessage = `**Thursday: **${cycle1[(shortIndex + 3) % 6]}, ${cycle2[(longIndex + 3) % 12]}, ${cycle3[(longIndex + 3) % 12]} & ${cycle4[(shortIndex + 3) % 6]}.\n`;
        const friMessage = `**Friday: **${cycle1[(shortIndex + 4) % 6]}, ${cycle2[(longIndex + 4) % 12]}, ${cycle3[(longIndex + 4) % 12]} & ${cycle4[(shortIndex + 4) % 6]}.\n`;
        const satMessage = `**Saturday: **${cycle1[(shortIndex + 5) % 6]}, ${cycle2[(longIndex + 5) % 12]}, ${cycle3[(longIndex + 5) % 12]} & ${cycle4[(shortIndex + 5) % 6]}.\n`;
        const sunMessage = `**Sunday: **${cycle1[(shortIndex + 6) % 6]}, ${cycle2[(longIndex + 6) % 12]}, ${cycle3[(longIndex + 6) % 12]} & ${cycle4[(shortIndex + 6) % 6]}.\n`;
        const notMessage = `**Not a daily: ** ${cycle2[(longIndex + 7) % 12]}, ${cycle2[(longIndex + 8) % 12]}, ${cycle2[(longIndex + 9) % 12]}, ${cycle2[(longIndex + 10) % 12]}, ${cycle2[(longIndex + 11) % 12]}, ${cycle3[(longIndex + 7) % 12]}, ${cycle3[(longIndex + 8) % 12]}, ${cycle3[(longIndex + 9) % 12]}, ${cycle3[(longIndex + 10) % 12]} & ${cycle3[(longIndex + 6) % 11]}.`

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

