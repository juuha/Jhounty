const fs = require('node:fs');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show_bounty_cycles')
        .setDescription("Shows which encounters are in each cycle."),
    async execute(interaction) {
        const { cycles } = require("../data/bountyCycles.json");

        const cyclesShort = cycles.map((cycle) => {
            return cycle.map((encounter) => encounter.short).join(", ");
        })

        await interaction.reply({
            content: `Cycle 1: ${cyclesShort[0]}\n\nCycle 2: ${cyclesShort[1]}\n\nCycle 3: ${cyclesShort[2]} \n\nCycle 4: ${cyclesShort[3]}.`,
            flags: MessageFlags.Ephemeral
        });
    }
}
