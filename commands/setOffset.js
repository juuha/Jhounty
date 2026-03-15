const fs = require('node:fs');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_offset')
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
        const bountyCycles = require("../data/bountyCycles.json");
        const cycleIndex = interaction.options.getInteger("cycle") - 1;
        const offset = interaction.options.getInteger("offset");

        bountyCycles["cycleOffsets"][cycleIndex] = offset;
        fs.writeFile('data/bountyCycles.json', JSON.stringify(bountyCycles, null, 4), async (error) => {
            if (error) console.error(error);
        });

        await interaction.reply({
            content: `The offset for cycle ${cycleIndex + 1} has been set to ${offset}.`,
            flags: MessageFlags.Ephemeral
        });
    }
}
