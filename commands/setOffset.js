const fs = require('node:fs');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setoffset')
        .setDescription('Set the offset for a raid bounty cycle.')
        .addIntegerOption((option) =>
            option.setName("cycle")
                .setDescription("Which raid bounty cycle?")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(4)
        )
        .addIntegerOption((option) =>
            option.setName("offset")
                .setDescription(`Set the offset for the chosen cycle.`)
                .setMinValue(0)
                .setMaxValue(100)
                .setRequired(true)
        ),
    async execute(interaction) {
        const cycle = interaction.options.getInteger("cycle");
        const offset = interaction.options.getInteger("offset");
        const cycleOffsets = ["cycle1offset", "cycle2offset", "cycle3offset", "cycle4offset"];
        let bounty_cycles = require("../bounty_cycles.json");
        bounty_cycles[cycleOffsets[cycle - 1]] = offset;
        fs.writeFile('bounty_cycles.json', JSON.stringify(bounty_cycles, null, 4), async (error) => {
            if (error) console.error(error);
        });

        await interaction.reply({
            content: `The offset for cycle ${cycle} has been set to ${offset}.`,
            flags: MessageFlags.Ephemeral
        });
    }
}
