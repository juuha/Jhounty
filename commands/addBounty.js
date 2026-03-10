const fs = require('node:fs');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addbounty')
        .setDescription('Add a new bounty to a raid cycle.')
        .addIntegerOption((option) =>
            option.setName("cycle")
                .setDescription("Which raid bounty cycle?")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(4)
        )
        .addStringOption((option) =>
            option.setName("fullname")
                .setDescription(`Full name of the Bounty.`)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("shortname")
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
        const bounty_cycles_json = require("../bounty_cycles.json");
        const cycleIndex = interaction.options.getInteger("cycle") - 1;

        const bounty = {
            "name": interaction.options.getString("fullname"),
            "short": interaction.options.getString("shortname"),
            "type": interaction.options.getString("type")
        };

        bounty_cycles_json["cycles"][cycleIndex].push(bounty);
        fs.writeFile('bounty_cycles.json', JSON.stringify(bounty_cycles_json, null, 4), async (error) => {
            if (error) console.error(error);
        });

        await interaction.reply({
            content: `The bounty ${bounty.name} has been added to cycle ${cycleIndex+1}.`,
            flags: MessageFlags.Ephemeral
        });
    }
}
