const fs = require('node:fs');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add_bounty')
        .setDescription('Add a new bounty to a raid cycle.')
        .addIntegerOption((option) =>
            option.setName("cycle")
                .setDescription("Which raid bounty cycle?")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(4)
        )
        .addStringOption((option) =>
            option.setName("full_name")
                .setDescription(`Full name of the Bounty.`)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("short_name")
                .setDescription("The shortened name. For example VG for Vale Guardian.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("What type of bounty is it? Raid or Strike?")
                .setRequired(true)
                .addChoices(
                    { name: "Raid", value: "raid"},
                    { name: "Strike", value: "strike"},
                )
        ),
    async execute(interaction) {
        const bountyCycles = require("../data/bountyCycles.json");
        const cycleIndex = interaction.options.getInteger("cycle") - 1;

        const bounty = {
            "name": interaction.options.getString("full_name"),
            "short": interaction.options.getString("short_name"),
            "type": interaction.options.getString("type")
        };

        bountyCycles["cycles"][cycleIndex].push(bounty);
        fs.writeFile('data/bountyCycles.json', JSON.stringify(bountyCycles, null, 4), async (error) => {
            if (error) console.error(error);
        });

        await interaction.reply({
            content: `The bounty ${bounty.name} has been added to cycle ${cycleIndex+1}.`,
            flags: MessageFlags.Ephemeral
        });
    }
}
