const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config.json');
const { guilds } = require('./data/guilds.json');
const deployCommands = require('./deploy_commands.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.once(Events.ClientReady, async (readyClient) => {
    const fetchedGuilds = (await client.guilds.fetch()).map((guild) => guild.id);
    const newGuilds = fetchedGuilds.filter((guildId) => !guilds.includes(guildId));
    newGuilds.forEach((guildId) => deployCommands(client.user.id, guildId));
    const guildsJSON = { guilds: fetchedGuilds };
    fs.writeFile('data/guilds.json', JSON.stringify(guildsJSON, null, 4), async (error) => {
        if (error) console.error(error);
    });
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.GuildCreate, async (guild) => {
    deployCommands(client.user.id, guild.id);
})


client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            await command.execute(interaction);
        } else { return; }
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

client.login(token);
