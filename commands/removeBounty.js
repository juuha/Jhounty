const fs = require('node:fs');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removebounty')
        .setDescription('Remove a bounty from all cycles it is found in.')
        .addStringOption((option) =>
            option.setName("name")
                .setDescription(`Full or short name of the Bounty.`)
                .setRequired(true)
        ),
    async execute(interaction) {
        const bounty_cycles_json = require("../data/bounty_cycles.json");
        const name = interaction.options.getString("name");

        let found = false;
        bounty_cycles_json["cycles"].forEach((cycle) => {
            cycle.some((bounty, index) => {
                if (bounty.name === name || bounty.short === name) {
                    cycle.splice(index, 1);
                    found = true;
                }
            })
        });
        
        if (found) {
            fs.writeFile('data/bounty_cycles.json', JSON.stringify(bounty_cycles_json, null, 4), async (error) => {
                if (error) console.error(error);
            });
            
            await interaction.reply({
                content: `Bounty with the name ${name} has been removed from all cycles it was found in.`,
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: `No bounty found with name ${name}.`,
                flags: MessageFlags.Ephemeral
            });
        }
    }
}
