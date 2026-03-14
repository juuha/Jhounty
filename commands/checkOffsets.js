const fs = require('node:fs');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check_offsets')
        .setDescription("Shows the current offsets for each cycle."),
    async execute(interaction) {
        const { cycleOffsets } = require("../data/bounty_cycles.json");

        await interaction.reply({
            content: `Offsets for each cycle: ${cycleOffsets[0]}, ${cycleOffsets[1]}, ${cycleOffsets[2]} and ${cycleOffsets[3]}.`,
            flags: MessageFlags.Ephemeral
        });
    }
}
