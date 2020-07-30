const { decode, getLevelByXp } = require('../../utils/SkyblockUtils');
const Armor = require('./SkyblockArmor');
const Item = require('./SkyblockItem');
const objectPath = require('object-path');

class SkyblockMember {
	constructor (data) {
		this.uuid = data.uuid;
		this.firstJoin = data.m.first_join;
		this.lastSave = data.m.last_save;
		this.getArmor = async () => {
			return new Promise((res) => {
				const base64 = data.m.inv_armor;
				const decoded = Promise.resolve(decode(base64.data));
				const armor = {
					helmet: decoded[3].id ? new Armor(decoded[3]) : null,
					chestplate: decoded[2].id ? new Armor(decoded[2]) : null,
					leggings: decoded[1].id ? new Armor(decoded[1]) : null,
					boots: decoded[0].id ? new Armor(decoded[0]) : null
				};
				res(armor);
			});
		};
		this.fairySouls = data.m.fairy_souls_collected || 0;
		this.skills = getSkills(data.m);
		this.collections = data.m.collection ? data.m.collection : null;
		this.getEnderChest = async () => {
			return new Promise((res, rej) => {
				const chest = data.m.ender_chest_contents;
				if (!chest) return res(null);

				try {
					const enderChest = Promise.resolve(decode(chest.data));

					const edited = [];
					for (let i = 0; i < enderChest.length; i++) {
						if (!enderChest[i].id) {
							edited.push({});
						} else {
							edited.push(new Item(enderChest[i]));
						}
					}
					return res(edited);
				} catch (e) {
					rej(e);
				}
			});
		};
		this.getInventory = async () => {
			return new Promise((res, rej) => {
				let inventory = data.m.inv_contents;
				if (!inventory) return res(null);

				try {
					inventory = Promise.resolve(decode(inventory.data));
					const edited = [];
					for (let i = 0; i < inventory.length; i++) {
						if (!inventory[i].id) {
							edited.push({});
						} else {
							edited.push(new Item(inventory[i]));
						}
					}
					return res(edited);
				} catch (e) {
					rej(e);
				}
			});
		};
		this.stats = (data.m.stats ? {
			purse: Math.floor(data.m.coin_purse) || 0,
			kills: data.m.stats.kills || 0,
			deaths: data.m.stats.deaths || 0,
			highest_crit_damage: Math.round(data.m.stats.highest_crit_damage * 100) / 100 || 0,
			highest_critical_damage: Math.round(data.m.stats.highest_critical_damage * 100) / 100 || 0,

			gifts_given: data.m.stats.gifts_given || 0,
			gifts_received: data.m.stats.gifts_received || 0
		} : null);
	}
}
/**
 * @param {object} data
 *
 * @return {object}
 */
function getSkills (data) {
	let skills = {};
	if (!objectPath.has(data, 'experience_skill_foraging')) {
		return null;
	}
	skills = {
		farming: getLevelByXp(data.experience_skill_farming),
		mining: getLevelByXp(data.experience_skill_mining),
		combat: getLevelByXp(data.experience_skill_combat),
		foraging: getLevelByXp(data.experience_skill_foraging),
		fishing: getLevelByXp(data.experience_skill_fishing),
		enchanting: getLevelByXp(data.experience_skill_enchanting),
		alchemy: getLevelByXp(data.experience_skill_alchemy),
		carpentry: getLevelByXp(data.experience_skill_carpentry),
		runecrafting: getLevelByXp(data.experience_skill_runecrafting, true)
	};
	return skills;
}

module.exports = SkyblockMember;
