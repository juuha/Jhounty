const { REST, Routes } = require('discord.js');
const { token } = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');

module.exports = async (cliendId, guildId) => {
	const commands = [];
	const commandsPath = path.join(__dirname, '../commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}

	const rest = new REST().setToken(token);
	(async () => {
		try {
			const data = await rest.put(Routes.applicationGuildCommands(cliendId, guildId), { body: commands });
			console.log(`Successfully sent ${data.length} application (/) commands to guild with id ${guildId}.`);
		} catch (error) {
			console.error(error);
		}
	})();
}
