const fs = require('node:fs');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete_personal_default')
        .setDescription('Deletes your personal default so you use the global profile by default again.')
        ,
    async execute(interaction) {
        const defaultProfiles = require("../data/defaultProfiles.json");
        delete defaultProfiles[interaction.user.id];

        fs.writeFile('data/defaultProfiles.json', JSON.stringify(defaultProfiles, null, 4), async (error) => {
            if (error) console.error(error);
        });

        await interaction.reply({
            content: `Your personal default bounties profile has been deleted.`,
            flags: MessageFlags.Ephemeral
        });
    }
}
